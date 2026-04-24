"use client";

import React, { useState, useEffect } from 'react';

/**
 * AMRIKYY LAB :: SOVEREIGN MARKETPLACE
 * DESIGN: CAIRO CYBERPUNK | ASSET FORMAT: .AIX
 */
export default function SovereignStore() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/marketplace')
      .then(res => res.json())
      .then(data => {
        if (data.success) setAssets(data.assets);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      backgroundColor: '#050505',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '"Outfit", sans-serif',
      padding: '40px',
      backgroundImage: 'radial-gradient(circle at bottom left, #0a0a0a, #050505)'
    }}>
      
      {/* Header */}
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #39FF14', paddingBottom: '20px', marginBottom: '50px' 
      }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '2px' }}>
            AIX <span style={{ color: '#39FF14' }}>SOVEREIGN FOUNDRY</span>
          </h1>
          <p style={{ opacity: 0.6, fontSize: '0.8rem', textTransform: 'uppercase' }}>Manufacturing Tradable Digital Lifeforms</p>
        </div>
        <div style={{ textAlign: 'right', border: '1px solid #F7B733', padding: '10px 20px', borderRadius: '10px' }}>
          <span style={{ color: '#F7B733', fontSize: '0.7rem' }}>TREASURY_GATEWAY</span>
          <div style={{ fontWeight: 'bold' }}>CONNECTED</div>
        </div>
      </header>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
        
        {loading ? (
          <div style={{ color: '#39FF14' }}>SCANNING MARKETPLACE...</div>
        ) : assets.length === 0 ? (
          <div style={{ color: '#555', gridColumn: 'span 3', textAlign: 'center', padding: '100px' }}>
            NO AIX ASSETS COMPILED YET. INITIATING FOUNDRY LOOP...
          </div>
        ) : assets.map((asset, i) => (
          <div key={i} style={{
            background: '#111',
            border: '1px solid #222',
            borderRadius: '20px',
            padding: '30px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#39FF14'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}
          >
            {/* Status Badge */}
            <div style={{ 
              position: 'absolute', top: '10px', right: '10px', 
              fontSize: '0.6rem', background: '#39FF14', color: '#000', 
              padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' 
            }}>
              .AIX READY
            </div>

            <h3 style={{ color: '#39FF14', fontSize: '1.2rem', marginBottom: '10px' }}>{asset.header.name}</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.6, height: '40px' }}>{asset.header.architect}</p>
            
            <div style={{ margin: '20px 0', borderTop: '1px solid #222', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '0.7rem', color: '#555' }}>SPECIALIZATION</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{asset.dna.specialization}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', color: '#555' }}>AIX_VERSION</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{asset.header.version}</span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
              marginTop: '30px', background: '#1a1a1a', padding: '15px', borderRadius: '12px' 
            }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: '#F7B733' }}>PRICE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F7B733' }}>{asset.dna.basePrice} <span style={{ fontSize: '0.8rem' }}>Pi</span></div>
              </div>
              <button style={{ 
                background: '#39FF14', color: '#000', border: 'none', 
                padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
              }}>
                ACQUIRE
              </button>
            </div>
          </div>
        ))}

      </div>

      {/* Footer */}
      <footer style={{ marginTop: '80px', textAlign: 'center', opacity: 0.3, fontSize: '0.7rem', letterSpacing: '2px' }}>
        AMRIKYY LAB // AIX STANDARD // TRADABLE SOVEREIGN INTELLIGENCE
      </footer>
    </div>
  );
}
