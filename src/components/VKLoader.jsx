'use client';

// A small geometric echo of the VK mark — three bars rising and falling
// out of phase, in the logo's own blue / red-orange / green. Used as the
// full-screen loader between login and first paint, and inline while a
// panel's data is in flight.
export default function VKLoader({ label, inline = false }) {
  const svg = (
    <svg className="vk-loader" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect className="bar bar-v" x="16" y="30" width="20" height="55" rx="6" fill="#1464C8" />
      <rect className="bar bar-k1" x="42" y="15" width="20" height="70" rx="6" fill="#DC4614" />
      <rect className="bar bar-k2" x="68" y="30" width="20" height="55" rx="6" fill="#50B428" />
    </svg>
  );

  if (inline) {
    return (
      <div className="vk-loader-inline" role="status" aria-label={label || 'Loading'}>
        {svg}
      </div>
    );
  }

  return (
    <div className="vk-loader-wrap" role="status" aria-label={label || 'Loading VEKTRA'}>
      {svg}
      {label && <div className="vk-loader-label">{label}</div>}
    </div>
  );
}
