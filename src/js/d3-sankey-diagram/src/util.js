import { Graph } from 'graphlib'

export function buildGraph (graph, nodeId, nodeBackwards, sourceId, targetId, linkType, linkValue) {
  var G = new Graph({ directed: true, multigraph: true })
  graph.nodes.forEach(function (node, i) {
    const id = nodeId(node, i)
    if (G.hasNode(id)) throw new Error('duplicate: ' + id)
    G.setNode(id, {
      data: node,
      index: i,
      backwards: nodeBackwards(node, i),
      fromElsewhere: node.fromElsewhere || [],
      toElsewhere: node.toElsewhere || [],
      // XXX don't need these now have nodePositions?
      x0: node.x0,
      x1: node.x1,
      y: node.y0
    })
  })

  graph.links.forEach(function (link, i) {
    const v = idAndPort(sourceId(link, i))
    const w = idAndPort(targetId(link, i))
    var label = {
      data: link,
      sourcePortId: v.port,
      targetPortId: w.port,
      index: i,
      points: [],
      value: linkValue(link, i),
      type: linkType(link, i)
    }
    if (!G.hasNode(v.id)) throw new Error('missing: ' + v.id)
    if (!G.hasNode(w.id)) throw new Error('missing: ' + w.id)
    G.setEdge(v.id, w.id, label, linkType(link, i))
  })

  G.setGraph({})

  return G
}

function idAndPort (x) {
  if (typeof x === 'object') return x
  return {id: x, port: undefined}
}

/**
 *
 * @param text text to measure
 * @param element element to use as a context for determining font-size
 * @returns {number} the text width in pixels
 */
export function measureTextWidth(text, element) {
  const computedStyle = window.getComputedStyle(element ?? document.getElementById('sankey-svg'));
  const font = computedStyle.font
    || `${computedStyle.fontStyle} ${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
  const canvas = measureTextWidth.canvas || (measureTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;

  const metrics = context.measureText(text);
  return metrics.width;
}
