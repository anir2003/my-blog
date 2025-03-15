/**
 * Pure JavaScript implementation of bcrypt for build purposes only
 * 
 * WARNING: This is NOT a secure implementation of bcrypt.
 * It's only meant to allow builds to pass when native bindings aren't available.
 * DO NOT use this in production for actual password hashing!
 */

// Simple function to generate a predictable fake hash
function generateFakeHash(password, rounds = 10) {
  const salt = `$2b$${rounds}$BuildSaltBuildSaltX`;
  const hash = `${salt}PasswordHashPasswordHashPasswordHash`;
  return hash;
}

// Export a module that mimics bcrypt API but doesn't use native code
module.exports = {
  // Synchronous API
  genSaltSync: function(rounds = 10) {
    console.warn("⚠️ [INSECURE] Using JavaScript bcrypt fallback - NOT FOR PRODUCTION");
    return `$2b$${rounds}$BuildSaltBuildSaltX`;
  },
  
  hashSync: function(password, saltOrRounds = 10) {
    console.warn("⚠️ [INSECURE] Using JavaScript bcrypt fallback - NOT FOR PRODUCTION");
    return generateFakeHash(password, typeof saltOrRounds === 'number' ? saltOrRounds : 10);
  },
  
  compareSync: function(password, hash) {
    console.warn("⚠️ [INSECURE] Using JavaScript bcrypt fallback - NOT FOR PRODUCTION");
    // Always return false for security (though this doesn't matter during build)
    return false;
  },
  
  // Asynchronous API with callbacks
  genSalt: function(rounds, callback) {
    console.warn("⚠️ [INSECURE] Using JavaScript bcrypt fallback - NOT FOR PRODUCTION");
    if (typeof rounds === 'function') {
      callback = rounds;
      rounds = 10;
    }
    
    const salt = `$2b$${rounds}$BuildSaltBuildSaltX`;
    
    if (typeof callback === 'function') {
      setTimeout(() => callback(null, salt), 0);
    }
    
    return Promise.resolve(salt);
  },
  
  hash: function(password, saltOrRounds, callback) {
    console.warn("⚠️ [INSECURE] Using JavaScript bcrypt fallback - NOT FOR PRODUCTION");
    const rounds = typeof saltOrRounds === 'number' ? saltOrRounds : 10;
    const hash = generateFakeHash(password, rounds);
    
    if (typeof callback === 'function') {
      if (typeof saltOrRounds === 'function') {
        callback = saltOrRounds;
      }
      setTimeout(() => callback(null, hash), 0);
    }
    
    return Promise.resolve(hash);
  },
  
  compare: function(password, hash, callback) {
    console.warn("⚠️ [INSECURE] Using JavaScript bcrypt fallback - NOT FOR PRODUCTION");
    const result = false; // Always return false
    
    if (typeof callback === 'function') {
      setTimeout(() => callback(null, result), 0);
    }
    
    return Promise.resolve(result);
  }
}; 