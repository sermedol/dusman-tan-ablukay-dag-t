type IconType = 'building' | 'bank' | 'people' | 'megaphone' | 'leaf';

interface NetworkNode {
  x: number;
  y: number;
  r: number;
  color: string;
  icon: IconType;
  pulse?: boolean;
}

const NODES: NetworkNode[] = [
  { x: 300, y: 90, r: 26, color: '#9a2f26', icon: 'building', pulse: true },
  { x: 430, y: 150, r: 20, color: '#3b6ea5', icon: 'bank' },
  { x: 150, y: 190, r: 18, color: '#5b4b8a', icon: 'people' },
  { x: 370, y: 300, r: 22, color: '#af402f', icon: 'building' },
  { x: 180, y: 340, r: 17, color: '#8f5f16', icon: 'megaphone' },
  { x: 300, y: 420, r: 19, color: '#316647', icon: 'leaf' },
];

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [3, 4],
  [3, 5],
  [1, 3],
];

function NodeIcon({ type }: { type: IconType }) {
  switch (type) {
    case 'building':
      return <path d="M-5-6h10v12h-10zM-3-3.5h1.4v1.4h-1.4zM1.6-3.5H3v1.4H1.6zM-3 .5h1.4v1.4h-1.4zM1.6.5H3v1.4H1.6z" fill="#fff" />;
    case 'bank':
      return <path d="M-6 3.5h12M-5 3.5V0l5-3.5L5 0v3.5M-4 3.5V0.5M-1.5 3.5V0.5M1.5 3.5V0.5M4 3.5V0.5" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round" />;
    case 'people':
      return (
        <>
          <circle cx="-2.4" cy="-2.5" r="1.9" fill="#fff" />
          <circle cx="2.6" cy="-1.5" r="1.9" fill="#fff" />
          <path d="M-6 4c0-2.4 1.7-4 3.6-4S1.2 1.6 1.2 4M0 4.4c.3-2 1.7-3.3 3.2-3.3 1.8 0 3.4 1.6 3.4 3.7" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </>
      );
    case 'megaphone':
      return <path d="M-5-1 3-4v8L-5 1zM3-1h2.5M-5 1v2.5a1 1 0 001 1h.5a1 1 0 001-1V1.8" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    case 'leaf':
      return <path d="M0-5C4-5 6-2 6 1c-4 0-6-2-6-6zM0-5C-4-5-6-2-6 1c4 0 6-2 6-6zM0-4v9" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    default:
      return null;
  }
}

export default function HeroNetworkArt() {
  return (
    <svg viewBox="0 0 560 520" className="h-auto w-full" role="img" aria-label="Sermaye grupları arasındaki bağlantıları temsil eden soyut ağ illüstrasyonu">
      <defs>
        <radialGradient id="heroBlob" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f2e2dc" />
          <stop offset="100%" stopColor="#f2e2dc" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d="M120 60C220 10 380 20 450 90C520 160 520 260 470 340C430 405 350 460 260 470C170 480 90 440 60 360C30 280 40 190 80 130C95 105 100 78 120 60Z"
        fill="url(#heroBlob)"
      />

      {EDGES.map(([a, b], i) => {
        const nodeA = NODES[a];
        const nodeB = NODES[b];
        return (
          <line
            key={i}
            x1={nodeA.x}
            y1={nodeA.y}
            x2={nodeB.x}
            y2={nodeB.y}
            stroke="#d6c9c3"
            strokeWidth="1.5"
            strokeDasharray="3 5"
          />
        );
      })}

      {NODES.map((node, i) => (
        <g key={i} transform={`translate(${node.x} ${node.y})`}>
          {node.pulse && (
            <circle r={node.r} fill={node.color} opacity="0.25" className="origin-center animate-pulse-ring" />
          )}
          <circle r={node.r} fill={node.color} stroke="#faf8f4" strokeWidth="4" />
          <g transform={`scale(${node.r / 22})`}>
            <NodeIcon type={node.icon} />
          </g>
        </g>
      ))}
    </svg>
  );
}
