/**
      * THIS IS A COMPILED TYPESCRIPT FILE
      * SEE THE ACTUAL SOURCE CODE AT https://github.com/lectrician1/Discographies
      * 
      * Name: discographies.js
      * Description: Shows useful discography data and functions on 
      *  discography items
      * Note: Only meant to work on page refresh. This is because the 
      *  lag time between creating a statement like "publication date"
      *  and it showing up in BlazeGraph and then by this script is high.
      * Author: Lectrician1
      * License: CC0
      * Functions taken from: 
      *  https://www.wikidata.org/wiki/User:Nikki/ExMusica.js
      *  https://www.wikidata.org/wiki/User:Magnus_Manske/duplicate_item.js
      */
(()=>{var _=class{constructor(t,e){this.id=t;this.label=e;this.id=t,this.label=e}},l=class extends _{},g=class extends _{},w=class extends g{},h=class extends _{},v=class{constructor(t){this.name=t}},m=class extends v{constructor(e,a,i,s){super(a);this.parentVariable=e,this.property=i,this.optional=s}},S=class extends v{constructor(t){super(t)}createGroupQuery(){return`?${this.name} ?${this.name}Label `}createSelectQuery(){return`?${this.name} ?${this.name}Label `}resultToTableCell(t){return P(t[this.name].value,t[`${this.name}Label`].value)}},f=class extends m{constructor(t,e,a,i){super(t,e,a,i)}createGroupQuery(){return`(GROUP_CONCAT (DISTINCT ?${this.name}; SEPARATOR = "|") AS ?${this.name}s)
(GROUP_CONCAT (DISTINCT ?${this.name}Label; SEPARATOR = "|") AS ?${this.name}Labels)
`}createSelectQuery(){return`?${this.name} ?${this.name}Label `}createQuery(){return`?${this.parentVariable.name} wdt:${this.property.id} ?${this.name}.
`}resultToTableCell(t){let e=t[`${this.name}s`],a=t[`${this.name}Labels`];if(e.value==="")return"";let i=e.value.split("|"),s=a.value.split("|");return i.map((n,o)=>P(n,s[o])).join(", ")}},T=class extends m{constructor(t,e,a,i){super(t,e,a,i)}createGroupQuery(){return`(GROUP_CONCAT (DISTINCT ?${this.name}; SEPARATOR = "|") AS ?${this.name}s)
`}createSelectQuery(){return`?${this.name} `}createQuery(){return`?${this.parentVariable.name} wdt:${this.property.id} ?${this.name}.
`}resultToTableCell(t){let e=t[`${this.name}s`];return e.value===""?"":e.value.split("|").map(s=>new Date(s).toISOString().split("T")[0]).join(", ")}},W=class extends m{constructor(t,e,a,i){super(t,e,a,i)}createGroupQuery(){return`(GROUP_CONCAT (?${this.name}; SEPARATOR = "|") AS ?${this.name}s)
(GROUP_CONCAT (?${this.name}Language; SEPARATOR = "|") AS ?${this.name}Languages)
`}createSelectQuery(){return`?${this.name} ?${this.name}Language `}createQuery(){return`?${this.parentVariable.name} wdt:${this.property.id} ?${this.name}.
BIND ( lang(?${this.name}) AS ?${this.name}Language )
`}resultToTableCell(t){let e=t[`${this.name}s`],a=t[`${this.name}Languages`];if(e.value==="")return"";let i=e.value.split("|"),s=a?a.value.split("|"):[];return i.map((o,b)=>`${o} (${s[b]})`).join(", ")}};async function y(r,t){return await $.post(r.sparqlEndpoint,{query:t})}var I=r=>r.replace(/.*\//,""),P=(r,t)=>`<a href="${r}">${t}</a>`;async function Q(r,t,e){var i=(await $.get("/w/api.php",{action:"wbgetentities",ids:r,format:"json"})).entities[r];$.each(i.claims,function(n,o){t.includes(String(n))?$.each(o,(b,c)=>{delete c.id}):delete i.claims[n]});var s={claims:{...i.claims,...e}};console.log(s),await D(r,s)}async function D(r,t){await q(async function(e){let a=await $.post("/w/api.php",{action:"wbeditentity",new:"item",data:JSON.stringify(t),token:e,summary:"Item release created from "+r,format:"json"});if(a.success==1){var i=a.entity.id,s="/wiki/"+i;window.open(s,"_blank")}else console.log(a),alert("A problem occurred, check JavaScript console for errors")})}async function q(r){var e=(await $.get("/w/api.php",{action:"query",meta:"tokens",format:"json"})).query.tokens.csrftoken;if(typeof e>"u"){alert("Problem getting edit token");return}await r(e)}var k=(r,t)=>({[r]:[{mainsnak:{snaktype:"value",property:r,datavalue:{value:{"entity-type":"item",id:t},type:"wikibase-entityid"},datatype:"wikibase-item"},type:"statement",rank:"normal"}]});async function x(r,t){let e=t.entities,a=r.title;$("#discographies").append('<a id="createRelease">Create release</a>'),$("#createRelease").on("click",async function(){let i="release",s=`SELECT ?release WHERE {
                    ?${i} wdt:${e.properties.release_of.id} wd:${r.claims.P31[0].mainsnak.datavalue.value.id};
                             wdt:${e.properties.subclass_of.id}* wd:${e.items.release.id}.
                  }`;var n=await y(t,s),o=[e.properties.performer,e.properties.genre,e.properties.number_of_parts_of_this_work,e.properties.publication_date,e.properties.record_label,e.properties.title,e.properties.tracklist].map(d=>d.id),b=I(n.results.bindings[0][i].value),c={...k(e.properties.release_of.id,a),...k(e.properties.instance_of.id,b)};await Q(a,o,c)})}async function C(r,t){console.log("hi");var e=t.entities;$("body").append(`<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.12.1/css/jquery.dataTables.css">
    <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.12.1/js/jquery.dataTables.js"><\/script>`);let a="chronologicalData";if($("#discographies").append(`<div id="${a}"></div>`),!O(e.properties.performer.id,[e.items.various_artists.id],r.claims))for(let i of r.claims[e.properties.performer.id]){let s=i.mainsnak.datavalue.value.id,n=$(`#${e.properties.performer.id}`).find(`a[href='/wiki/${s}']`).html(),o=`${s}-chronological-data`;$(`#${a}`).append(`<div id="${o}">
			<a>Show chronological data for ${n}</a>
			<span></span>
			<table style="display: none"></table>
		</div>`),$(`#${o} a`).one("click",async function(){$(`#${o} > span`).html("Loading...");let b=mw.config.get("wgContentLanguage"),c=new S("label"),d=[c,new f(c,"release",e.properties.instance_of,!1),new f(c,"release_type",e.properties.form_of_creative_work,!0),new T(c,"date",e.properties.publication_date,!0),new W(c,"title",e.properties.title,!0),new f(c,"language",e.properties.language_of_work_or_name,!0)],u="SELECT DISTINCT ";for(let p of d)u+=p.createGroupQuery();u+=`WHERE {
        {
            SELECT `;for(let p of d)u+=p.createSelectQuery();u+=`WHERE {
        SERVICE wikibase:label { bd:serviceParam wikibase:language "${b}". }
        VALUES ?performer {wd:${s}}
        ?label wdt:${e.properties.performer.id} ?performer.
        ?release wdt:${e.properties.subclass_of.id}* wd:${e.items.release_group.id}.
    `;for(let p of d)p instanceof m&&(p.optional?u+=`OPTIONAL {
                    ${p.createQuery()}
                }
                `:u+=p.createQuery());u+=`} 
        }
    } GROUP BY ${c.createSelectQuery()}`,console.log(u);let A=await y(t,u);$(`#${o} table`).append(`
        <thead>
            <tr></tr>
        </thead>
        <tbody></tbody>`);for(let p of d)$(`#${o} > table > thead > tr`).append(`<th>${p.name}</th>`);for(var E of A.results.bindings){$(`#${o} > table > tbody`).append("<tr></tr>");for(let p of d){let L=p.resultToTableCell(E);$(`#${o} > table > tbody > tr`).eq(-1).append(`<td>${L}</td>`)}}$(`#${o} > table`).DataTable(),$(`#${o} > div > table`).show(),$(`#${o} > span`).remove(),$(`#${o} > a`).on("click",function(){$(`#${o} > div`).slideToggle("fast")})})}}function O(r,t,e){for(let a of e[r])if(t.includes(a.mainsnak.datavalue.value.id))return!0;return!1}async function R(r,t){let e="createTrack",a={"music track with vocals":t.items.music_track_with_vocals.id,"music track without vocals":t.items.music_track_without_vocals.id,"audio track":t.items.audio_track.id};V(e,a),j(e,t,r)}function V(r,t){$(".wikibase-sitelinkgrouplistview").append(`<form id="${r}">
    <label for="type">Create a track:</label>
    <select id="trackType" name="type">
    </select>
    <input type="submit">
  </form>`),$.each(t,function(e,a){$("#trackType").append(`<option value="${a}">${e}</option>`)})}function j(r,t,e){$(`#${r}`).on("submit",async function(a){a.preventDefault();let i=String($("#trackType").val()),s=[t.properties.title.id,t.properties.performer.id,t.properties.publication_date.id],n={...k(t.properties.instance_of.id,i),...k(t.properties.recording_performance_of.id,e)};await Q(e,s,n)})}mw.hook("wikibase.entityPage.entityLoaded").add(async function(r){let t=G();var e=t.entities;if(r.type!=="item"||!r.claims.hasOwnProperty(e.properties.instance_of.id))return;let a=r.title,i=`ASK {
        wd:${a} wdt:${e.properties.instance_of.id}/wdt:${e.properties.subclass_of.id}* wd:${e.items.release_group.id};
        wdt:${e.properties.performer.id} [].
    }`;$("#toc").after('<div id="discographies"></div>'),(await y(t,i)).boolean&&(await C(r,t),await x(r,t));let s=n=>n.mainsnak.datavalue.value.id===e.items.musical_work_composition.id;r.claims.P31.find(s)&&R(a,e)});function G(){var r;switch(window.location.hostname){case"www.wikidata.org":r={sparqlEndpoint:"https://query.wikidata.org/sparql?format=json",entities:{items:{release_group:{id:"Q108346082"},release:{id:"Q2031291"},various_artists:{id:"Q3108914"},musical_work_composition:{id:"Q105543609"},song:{id:"Q7366"},audio_track:{id:"Q7302866"},music_track_with_vocals:{id:"Q55850593"},music_track_without_vocals:{id:"Q55850643"}},properties:{instance_of:new l("P31","instance_of"),subclass_of:new l("P279","subclass_of"),title:new h("P1476","title"),genre:new l("P136","genre"),performer:new l("P175","performer"),record_label:new l("P264","record_label"),publication_date:new g("P577","publication_date"),number_of_parts_of_this_work:new w("P2635","number_of_parts_of_this_work"),tracklist:new l("P658","tracklist"),release_of:new l("P9831","release_of"),form_of_creative_work:new l("P7937","form_of_creative_work"),language_of_work_or_name:new l("P407","language_of_work_or_name"),recording_performance_of:new l("P2550","recording_performance_of")}}};break;default:throw new Error("This script is not supported on this site. Please add siteData")}return r}})();
