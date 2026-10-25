import mongoose from 'mongoose';
import dns from 'dns/promises';

/**
 * Convert mongodb+srv URI into standard direct replicaSet URI if TLS SNI handshake fails on Windows/Node 24
 */
async function resolveSrvUri(srvUri) {
  try {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?#]+)(\/.*)?$/);
    if (!match) return null;

    const [, user, pass, host, pathPart = ''] = match;
    const [srvRecords, txtRecords] = await Promise.all([
      dns.resolveSrv(`_mongodb._tcp.${host}`),
      dns.resolveTxt(host).catch(() => []),
    ]);

    if (!srvRecords || srvRecords.length === 0) return null;

    const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
    const txtParams = txtRecords.flat().join('&');
    const dbPath = pathPart.replace(/^\//, '').split('?')[0] || 'ai_mystery_room';

    let options = 'ssl=true';
    if (txtParams) {
      options += `&${txtParams}`;
    }

    return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${hosts}/${dbPath}?${options}`;
  } catch (err) {
    console.warn('[MongoDB] SRV fallback resolution warning:', err.message);
    return null;
  }
}

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const connectionOptions = {
    tlsAllowInvalidCertificates: true,
    dbName: 'ai_mystery_room',
    serverSelectionTimeoutMS: 8000,
  };

  try {
    const conn = await mongoose.connect(mongoUri, connectionOptions);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (primaryError) {
    console.warn(`[MongoDB] Primary connection failed (${primaryError.message}). Attempting SRV fallback...`);

    if (mongoUri.includes('+srv')) {
      const fallbackUri = await resolveSrvUri(mongoUri);
      if (fallbackUri) {
        try {
          const fallbackConn = await mongoose.connect(fallbackUri, connectionOptions);
          console.log(`[MongoDB] Connected successfully via replicaSet seedlist to: ${fallbackConn.connection.host}`);
          return fallbackConn;
        } catch (fallbackError) {
          console.error(`[MongoDB] Fallback connection failed: ${fallbackError.message}`);
        }
      }
    }

    throw primaryError;
  }
};
