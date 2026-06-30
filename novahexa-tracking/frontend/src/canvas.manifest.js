export const manifest = {
  screens: {
    scr_v9ryzr: { name: "Accueil", route: "/", position: { "x": 160, "y": 220 } },
    scr_11cvni: { name: "Suivi de colis", route: "/track/NOVA-84729", position: { "x": 160, "y": 2200 } },
    scr_vkjors: { name: "Dashboard (Admin)", route: "/dashboard", position: { "x": 160, "y": 4180 } }
  },
  sections: {
    sec_y2zy3r: { name: "Home", x: 0, y: 0, width: 1520, height: 1180 },
    sec_zhssgy: { name: "Package tracking", x: 0, y: 1980, width: 1520, height: 1180 },
    sec_h8ru2t: { name: "Admin Dashboard", x: 0, y: 3960, width: 1520, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_y2zy3r", children: [
    { kind: "screen", id: "scr_v9ryzr" }]
  },
  { kind: "section", id: "sec_zhssgy", children: [
    { kind: "screen", id: "scr_11cvni" }]
  },
  { kind: "section", id: "sec_h8ru2t", children: [
    { kind: "screen", id: "scr_vkjors" }]
  }]

};