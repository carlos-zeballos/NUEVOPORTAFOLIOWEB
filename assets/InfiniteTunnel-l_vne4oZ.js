import{U as p,r as d,j as z,V as s,N as O,O as V,X as Q,Y as Z,Q as L,T as A,Z as q,_ as X}from"./index-Bvxghzhp.js";import{ap as $,aq as J,j as K,m as ee,al as te,ab as C,C as B,ak as oe,ah as ae,ai as ne,ar as le,f as E,W as M}from"./react-three-fiber.esm-DvZF26Vi.js";const P=5,R=P*P;function re(t){let e=t>>>0;return()=>{e+=1831565813;let o=Math.imul(e^e>>>15,1|e);return o^=o+Math.imul(o^o>>>7,61|o),((o^o>>>14)>>>0)/4294967296}}function m(t,e){return t[Math.floor(e()*t.length)]}function x(t,e,o,n){const a=o()*Math.PI*2,l=t.createLinearGradient(e/2-Math.cos(a)*e*.7,e/2-Math.sin(a)*e*.7,e/2+Math.cos(a)*e*.7,e/2+Math.sin(a)*e*.7);return n.forEach((r,c)=>l.addColorStop(c/Math.max(1,n.length-1),r)),l}function se(t,e,o){const n=e*(.35+o()*.4),a=e*(.08+o()*.16),l=1+o()*1.6,r=o()*Math.PI*2;t.beginPath(),t.moveTo(0,e);for(let c=0;c<=e;c+=8)t.lineTo(c,n+Math.sin(c/e*Math.PI*l+r)*a);t.lineTo(e,e),t.closePath(),t.fillStyle=x(t,e,o,[m(p.art,o),m(p.deep,o)]),t.fill()}function ie(t,e,o){const n=e*(.2+o()*.6),a=e*(.3+o()*.7),l=e*(.22+o()*.3);t.lineWidth=l*(.35+o()*.3),t.lineCap="round",t.strokeStyle=x(t,e,o,[m(p.art,o),m(p.art,o)]);const r=o()*Math.PI*2;t.beginPath(),t.arc(n,a,l,r,r+Math.PI*(.9+o()*.7)),t.stroke()}function ue(t,e,o){const n=e*(.3+o()*.35),a=o()<.5?0:e;t.beginPath(),t.arc(a,e*(.3+o()*.6),n,0,Math.PI*2),t.fillStyle=x(t,e,o,[m(p.art,o),m(p.deep,o)]),t.fill()}function ce(t,e,o){const n=2+Math.floor(o()*3),a=e/(n+1);t.fillStyle=x(t,e,o,[m(p.art,o),m(p.deep,o)]),t.beginPath(),t.moveTo(e,e);for(let l=0;l<=n;l+=1){const r=e*(.2+l/n*.55);t.lineTo(e-l*a,r),t.lineTo(e-(l+1)*a,r)}t.lineTo(0,e),t.closePath(),t.fill()}function he(t,e,o){t.save(),t.translate(e/2,e/2),t.rotate((o()-.5)*1.6),t.fillStyle=x(t,e,o,[m(p.art,o),m(p.art,o)]),t.fillRect(-e,-e*(.06+o()*.12),e*2,e*(.12+o()*.2)),t.restore()}function fe(t,e,o){t.strokeStyle=m(p.art,o),t.globalAlpha=.55,t.lineWidth=e*.008;const n=e*(.05+o()*.05);for(let a=n;a<e;a+=n)t.beginPath(),t.moveTo(0,a),t.lineTo(e,a+Math.sin(a*.02)*e*.06),t.stroke();t.globalAlpha=1}const pe=[se,ie,ue,ce,he];function ve(t,e,o){const n=re(o*9301+49297);t.save(),t.fillStyle=x(t,e,n,[m(p.deep,n),m(p.art.slice(1,4),n)]),t.fillRect(0,0,e,e),o%5===3&&fe(t,e,n);const a=2+Math.floor(n()*2);for(let r=0;r<a;r+=1)m(pe,n)(t,e,n);const l=t.createLinearGradient(0,0,0,e);l.addColorStop(0,"rgba(0,0,0,0)"),l.addColorStop(1,"rgba(0,0,0,0.28)"),t.fillStyle=l,t.fillRect(0,0,e,e),t.restore()}function de(t,e,o){const n=o.naturalWidth/o.naturalHeight,a=n>1?o.naturalHeight:o.naturalWidth,l=n>1?(o.naturalWidth-a)/2:0;let r=o,c=l,h=a;for(;h>e*2;){const g=Math.ceil(h/2),i=document.createElement("canvas");i.width=i.height=g;const u=i.getContext("2d");u.imageSmoothingQuality="high",u.drawImage(r,c,0,h,h,0,0,g,g),r=i,c=0,h=g}t.imageSmoothingEnabled=!0,t.imageSmoothingQuality="high",t.drawImage(r,c,0,h,h,0,0,e,e)}function me(t,e){const o=document.createElement("canvas");o.width=o.height=e*P;const n=o.getContext("2d"),a=new $(o);a.colorSpace=J,a.minFilter=K,a.magFilter=ee,a.anisotropy=4;const l=(i,u)=>{n.save(),n.translate(i%P*e,Math.floor(i/P)*e),n.beginPath(),n.rect(0,0,e,e),n.clip(),u(n),n.restore()},r=R-t.length;for(let i=0;i<R;i+=1)l(i,u=>ve(u,e,i+1));let c=!1,h=0;const g=()=>{h||(h=requestAnimationFrame(()=>{h=0,a.needsUpdate=!0}))};return t.forEach((i,u)=>{const w=new Image;w.decoding="async",w.onload=()=>{c||(l(r+u,T=>de(T,e,w)),g())},w.src=i}),{texture:a,firstPhoto:r,dispose:()=>{c=!0,cancelAnimationFrame(h),a.dispose()}}}function ge(){const t=d.useRef({velocity:0,lastY:0,lastAt:0});return d.useEffect(()=>{const e=t.current;e.lastY=window.scrollY,e.lastAt=performance.now();const o=()=>{const n=performance.now(),a=Math.max(16,n-e.lastAt)/1e3,l=(window.scrollY-e.lastY)/window.innerHeight;e.velocity=e.velocity*.5+l/a*.5,e.lastY=window.scrollY,e.lastAt=n};return window.addEventListener("scroll",o,{passive:!0}),()=>window.removeEventListener("scroll",o)},[]),t}function we(t,e){const o=t.current;return performance.now()-o.lastAt>90&&(o.velocity*=Math.exp(-e*6)),o.velocity}const ye=0,Se=1,Me=2,be=3;function Fe(t){const e=M.smoothstep(t,A.accelStart,A.portalEnd);return t*s.scrollDistance+e**s.rushCurve*s.rushDistance}function Te(){const{width:t,height:e}=C(o=>o.size);return d.useMemo(()=>{const o=t/Math.max(1,e),n=o<.9||t<768,{cell:a}=s,l=o<.9?s.portraitHeight:s.height,r=M.clamp(l*o*.92,s.minWidth,s.maxWidth),c=Math.round((n?s.depth.mobile:s.depth.desktop)/a);return{width:r,height:l,depth:c*a,cols:Math.max(2,Math.round(r/a)),rows:Math.max(2,Math.round(l/a)),slices:c,back:a,mobile:n}},[t,e])}const Ae=`
  float wrapZ(float z) {
    float zz = z + uTravel;
    return zz - floor(zz / uDepth) * uDepth - uDepth + uBack;
  }
`,Pe=`
  attribute vec3 aCenter;
  attribute vec2 aCell;
  attribute float aWall;
  attribute float aSeed;
  uniform float uTravel, uDepth, uBack, uWidth, uHeight, uDensity, uPhotoShare, uTiles, uFirstPhoto;
  varying vec2 vUv;
  varying vec2 vSize;
  varying float vTile;
  varying float vDepth;
  ${Ae}
  float hash(float n) { return fract(sin(n) * 43758.5453123); }
  void main() {
    float zz = aCenter.z + uTravel;
    float cycle = floor(zz / uDepth);
    float z = wrapZ(aCenter.z);
    float s = aSeed + cycle * 31.17;
    float on = step(hash(s), uDensity);
    float photo = step(hash(s + 5.1), uPhotoShare);
    vTile = photo > 0.5
      ? uFirstPhoto + floor(hash(s + 7.3) * (uTiles - uFirstPhoto))
      : floor(hash(s + 9.7) * uFirstPhoto);
    vec2 size = aCell * vec2(0.78 + 0.16 * hash(s + 2.2), 0.78 + 0.16 * hash(s + 3.3));
    float lift = 0.02 + 0.34 * pow(hash(s + 4.4), 2.0);
    vec2 p = position.xy * size * on;
    vec3 w;
    if (aWall < 0.5) w = vec3(aCenter.x + p.x, -uHeight * 0.5 + lift * 0.25, z - p.y);
    else if (aWall < 1.5) w = vec3(aCenter.x + p.x, uHeight * 0.5 - lift * 0.25, z + p.y);
    else if (aWall < 2.5) w = vec3(-uWidth * 0.5 + lift, aCenter.y + p.y, z - p.x);
    else w = vec3(uWidth * 0.5 - lift, aCenter.y + p.y, z + p.x);
    vUv = uv;
    vSize = size;
    vec4 mv = modelViewMatrix * vec4(w, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`,Ce=`
  uniform sampler2D uAtlas;
  uniform vec3 uVoid, uTone;
  uniform float uGrid, uFar, uFade, uFogScale, uFocus, uMono;
  varying vec2 vUv;
  varying vec2 vSize;
  varying float vTile;
  varying float vDepth;
  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  void main() {
    vec2 p = (vUv - 0.5) * vSize;
    float d = roundedBox(p, vSize * 0.5, min(vSize.x, vSize.y) * 0.055);
    if (d > 0.0) discard;
    vec2 uv = vUv;
    float ratio = vSize.x / vSize.y;
    uv = ratio > 1.0 ? vec2(uv.x, (uv.y - 0.5) / ratio + 0.5) : vec2((uv.x - 0.5) * ratio + 0.5, uv.y);
    vec2 tile = vec2(mod(vTile, uGrid), uGrid - 1.0 - floor(vTile / uGrid));
    float inset = clamp(max(fwidth(uv.x), fwidth(uv.y)) * 1.5, 0.004, 0.1);
    vec3 col = texture2D(uAtlas, (tile + clamp(uv, inset, 1.0 - inset)) / uGrid).rgb;
    float aa = fwidth(d);
    col *= 1.0 - smoothstep(-aa * 2.5, 0.0, d) * 0.55;
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(col, uTone * luma, max(uMono, uFocus * 0.88));
    col *= 1.0 - uFocus * 0.55;
    float far = uFar * uFogScale;
    float fog = 1.0 - smoothstep(far * 0.38, far * 0.94 + 0.001, vDepth);
    gl_FragColor = vec4(mix(uVoid, col, fog * uFade), 1.0);
    #include <colorspace_fragment>
  }
`;function ze(t){const{width:e,height:o,cols:n,rows:a,slices:l}=t,{cell:r}=s,c=e/n,h=o/a,g=[],i=[],u=[],w=[],T=(F,f,y,S,I,D)=>{g.push(F,f,y),i.push(I,D),u.push(S),w.push(w.length*1.618+.37)};for(let F=0;F<l;F+=1){const f=-(F+.5)*r;for(let y=0;y<n;y+=1){const S=-e/2+(y+.5)*c;T(S,0,f,ye,c,r),T(S,0,f,Se,c,r)}for(let y=0;y<a;y+=1){const S=-o/2+(y+.5)*h;T(0,S,f,Me,r,h),T(0,S,f,be,r,h)}}const v=new ne(1,1),b=new le;return b.index=v.index,b.setAttribute("position",v.getAttribute("position")),b.setAttribute("uv",v.getAttribute("uv")),b.setAttribute("aCenter",new E(new Float32Array(g),3)),b.setAttribute("aCell",new E(new Float32Array(i),2)),b.setAttribute("aWall",new E(new Float32Array(u),1)),b.setAttribute("aSeed",new E(new Float32Array(w),1)),b.instanceCount=u.length,v.dispose(),b}function xe(){const t=Te(),e=C(v=>v.camera),o=ge(),n=d.useRef({travel:0,speed:0,follow:0,born:-1}),a=t.mobile?s.fov.mobile:s.fov.desktop,l=C(v=>v.gl.capabilities.getMaxAnisotropy()),r=C(v=>v.gl.capabilities.maxTextureSize),c=C(v=>Math.max(v.size.width,v.size.height)*v.viewport.dpr),h=!t.mobile&&c>=s.hdFromPixels&&r>=s.hdTile*P,g=t.mobile?224:h?s.hdTile:448,i=d.useMemo(()=>me(h?Q:Z,g),[h,g]);d.useEffect(()=>i.dispose,[i]),d.useEffect(()=>{i.texture.anisotropy=Math.min(16,l),i.texture.needsUpdate=!0},[i,l]);const u=d.useMemo(()=>({uTravel:{value:0},uDepth:{value:1},uBack:{value:1},uWidth:{value:1},uHeight:{value:1},uFar:{value:1},uFade:{value:0},uDensity:{value:s.density},uPhotoShare:{value:s.photoShare},uTiles:{value:R},uFirstPhoto:{value:i.firstPhoto},uGrid:{value:P},uAtlas:{value:i.texture},uVoid:{value:new B(p.void)},uFogScale:{value:1},uFocus:{value:0},uTone:{value:new B(p.tone)},uMono:{value:s.monochrome}}),[i]),w=d.useMemo(()=>ze(t),[t]),T=d.useMemo(()=>new oe({uniforms:u,vertexShader:Pe,fragmentShader:Ce}),[u]);return d.useEffect(()=>()=>w.dispose(),[w]),d.useEffect(()=>()=>T.dispose(),[T]),d.useEffect(()=>{u.uDepth.value=t.depth,u.uBack.value=t.back,u.uWidth.value=t.width,u.uHeight.value=t.height,u.uFar.value=t.depth-t.back,e.fov=a,e.near=.05,e.far=t.depth+4,e.position.set(0,0,0),e.lookAt(0,0,-1),e.updateProjectionMatrix()},[t,u,e,a]),ae((v,b)=>{const F=Math.min(b,.05),f=n.current,y=performance.now()/1e3;f.born<0&&(f.born=y);const S=y-f.born,I=M.smootherstep(S,.15,s.introRamp);we(o,F);let D=0;{f.speed=M.damp(f.speed,s.drift*I,1/s.damping,F);const N=Fe(L.progress),_=s.followMaxSpeed*F;D=M.clamp(M.damp(f.follow,N,s.follow,F)-f.follow,-_,_),f.follow+=D}f.travel=(f.travel+f.speed*F+D)%(t.depth*64),u.uTravel.value=f.travel,u.uFade.value=M.smoothstep(S,.05,s.introFade);const k=L.progress,H=M.smoothstep(k,A.accelStart,A.portalEnd),Y=M.smoothstep(k,A.portalStart,A.portalEnd);u.uFogScale.value=(1-Y)**1.15,u.uFocus.value=M.smoothstep(S,q,q+.7)*(1-M.smoothstep(k,A.questionOut,A.questionOut+.1));const W=S,{sway:G}=s,j=1-H*.7;e.position.set(Math.sin(W*.31)*G.x*j,Math.cos(W*.23)*G.y*j,0),e.rotation.set(0,0,Math.sin(W*.17)*G.roll);const U=a+M.smootherstep(H,0,1)*s.rushFov;Math.abs(e.fov-U)>.01&&(e.fov=U,e.updateProjectionMatrix())}),z.jsx(z.Fragment,{children:z.jsx("mesh",{geometry:w,material:T,frustumCulled:!1})})}function De(){const t=C(e=>e.setFrameloop);return d.useEffect(()=>{let e=null;const o=()=>{const l=L.reveal<X?"always":"never";l!==e&&(e=l,t(l))};o();const n=O(o),a=V(o);return()=>{n(),a()}},[t]),null}function ke(){const[t]=d.useState(()=>window.matchMedia("(max-width: 767px), (pointer: coarse)").matches);return z.jsxs(te,{flat:!0,dpr:[1,t?s.maxDpr.mobile:s.maxDpr.desktop],gl:{antialias:!0,alpha:!1,powerPreference:"high-performance"},camera:{fov:s.fov.desktop,near:.05,far:60,position:[0,0,0]},onCreated:({gl:e})=>e.setClearColor(p.void),children:[z.jsx(De,{}),z.jsx(xe,{})]})}export{ke as InfiniteTunnel};
