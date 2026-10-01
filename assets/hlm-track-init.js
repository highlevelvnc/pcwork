/* hlm-track: canal + origem do contacto. Corre depois de consent.js e hlm-track.js (defer, por ordem). */
if (window.hlmTrack) window.hlmTrack.init({ legacy: {}, ref: true, collect:{ url:"https://hlm-painel.vercel.app/api/collect", slug:"pcwork", key:"c3e3e75e6e9fcd1781f53f61f15893ea84cf64b99ae060d3" } });
