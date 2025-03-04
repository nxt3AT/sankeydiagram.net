import { max } from 'd3-array'
import {measureTextWidth} from '../util';

// export function minEdgeDx (w, y0, y1) {
//   console.log('mindx', w, y0, y1)
//   const dy = y1 - y0
//   const ay = Math.abs(dy) - w  // final sign doesn't matter
//   const dx2 = w * w - ay * ay
//   const dx = dx2 >= 0 ? Math.sqrt(dx2) : w
//   return dx
// }

export default function positionHorizontally (G, width, nodeWidth, nodeTitleWithSuffix) {
  // const minWidths = new Array(maxRank).fill(0)
  // G.edges().forEach(e => {
  //   const r0 = G.node(e.v).rank || 0
  //   minWidths[r0] = Math.max(minWidths[r0], minEdgeDx(G.edge(e).dy, G.node(e.v).y, G.node(e.w).y))
  // })
  // for (let i = 0; i < nested.length - 1; ++i) {
  //   minWidths[i] = 0
  //   nested[i].forEach(band => {
  //     band.forEach(d => {
  //       // edges for dummy nodes, outgoing for real nodes
  //       (d.outgoing || d.edges).forEach(e => {
  //         minWidths[i] = Math.max(minWidths[i], minEdgeDx(e))
  //       })
  //     })
  //   })
  // }
  // const totalMinWidth = sum(minWidths)
  // let dx
  // if (totalMinWidth > width) {
  //   // allocate fairly
  //   dx = minWidths.map(w => width * w / totalMinWidth)
  // } else {
  //   const spare = (width - totalMinWidth) / (nested.length - 1)
  //   dx = minWidths.map(w => w + spare)
  // }

  const maxRank = max(G.nodes(), u => G.node(u).rank || 0) || 0

  const sankeyNodeTextPlacementSetting = document.getElementById('sankey-settings-node-text-placement').value;
  const sankeySvg = document.querySelector('.nodes text');
  const maxLabelWidthInRank = {
    0: 50 + Math.max(...Object.values(G._nodes).filter(n => n.rank === 0).map(n => measureTextWidth(nodeTitleWithSuffix ? nodeTitleWithSuffix(n) : n.data.id, sankeySvg))),
    [maxRank]: Math.max(...Object.values(G._nodes).filter(n => n.rank === maxRank).map(n => measureTextWidth(nodeTitleWithSuffix ? nodeTitleWithSuffix(n) : n.data.id, sankeySvg))),
  };
  const scaleFactor =  sankeyNodeTextPlacementSetting === 'outside' ? 1 - (maxLabelWidthInRank[0] + maxLabelWidthInRank[maxRank])/width : 1;
  let dx = ((width - nodeWidth) / (maxRank)) * scaleFactor;

  G.nodes().forEach(u => {
    const node = G.node(u)

    if(sankeyNodeTextPlacementSetting === 'outside') {
      const isBeginning = node.data.incoming?.length === 0;
      const isEnd = node.data.outgoing?.length === 0;
      node.x0 = (maxLabelWidthInRank[0] + dx/(1+(0.01)) * (node.rank || 0));

      if(isBeginning) {
        if(!maxLabelWidthInRank[node.rank]) maxLabelWidthInRank[node.rank] = 1.75 * Math.max(...Object.values(G._nodes).filter(n => n.rank === node.rank).map(n => measureTextWidth(n.data.id)))
      }
      if(isEnd) {
        if(!maxLabelWidthInRank[node.rank]) maxLabelWidthInRank[node.rank] = 3 * Math.max(...Object.values(G._nodes).filter(n => n.rank === node.rank).map(n => measureTextWidth(n.data.id)))
      }
    } else {
      node.x0 = dx/(1+(0.01)) * (node.rank || 0);
    }

    node.x1 = node.x0 + nodeWidth
  })
}
