import{G as r,C as o}from"./Game-Dbs3negb.js";class n extends r{$setupElement(s){this.$defaultState=[1,2,3,0];for(let e=0;e<4;e++){const t=this.$createVertex((e-1.5)*32,0,e);this.$vertices.push(t),s.appendChild(t)}for(let e=0;e<3;e++){const t=new o(this.$vertices[e],this.$vertices[e+1]);this.$connectors.set(t,[e,e+1])}}}export{n as Stage};
//# sourceMappingURL=Stage1階のカギ-RKu66ruf.js.map
