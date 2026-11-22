# Mosalum Digital

Portfolio ya kujitegemea ya Mohamed Salum kwa huduma za IT, miundombinu, software na web development, nyaraka za kiufundi na usanifu wa michoro. Tovuti ni static, haina framework wala dependencies za ziada, na inafaa GitHub Pages. Jina la umma ni Mosalum Digital; halidai kuwa kampuni imesajiliwa.

## Kuendesha na kusimamia kazi kwa localhost

Paneli ya `localhost` huhariri `works.json`, huhifadhi picha kwenye `assets/works/`, hutengeneza kurasa za miradi, kisha kitufe cha **Hifadhi na chapisha** hutengeneza commit ya faili hizo na kufanya `git push` kwenye branch ya sasa. Git Credential Manager ya kompyuta yako ndiyo hushughulikia kuingia GitHub; nywila au tokeni haihifadhiwi kwenye paneli.

1. Fungua clone ya Git ya `Mosalum/portfolio` kwenye VS Code. Hakikisha Git imewekwa na `git remote -v` inaonyesha remote ya GitHub iitwayo `origin`.
2. Kama hujawahi kuingia GitHub kwa Git kwenye kompyuta hii, fanya `git push` ya majaribio kutoka terminal. Git Credential Manager itafungua login ya GitHub kwenye browser. Usibandike tokeni ndani ya mradi.
3. Fungua terminal ya VS Code kwenye folder kuu lenye `package.json`, endesha `npm run admin`, kisha fungua `http://127.0.0.1:4178/admin.html`.
4. Ongeza, hariri au futa kazi. Jaza maelezo yaliyothibitishwa tu, kisha chagua **Hifadhi na chapisha**. Programu hujenga kurasa, huweka kwenye commit `works.json`, `projects/` na `assets/works/` pekee, kisha husukuma commit kwenye branch iliyo wazi.
5. Acha terminal ya msimamizi ikiendelea kufanya kazi unapoitumia. Simamisha kwa `Ctrl+C`. Preview ya kawaida ya tovuti ni `npm run preview` kwenye terminal nyingine.

Msimamizi hufungwa kwa `127.0.0.1` pekee, na cookie ya kikao hutengenezwa na server wakati wa kuanza. Mabadiliko mengine yoyote yaliyowekwa Git stage husababisha uchapishaji kusimama ili yasichanganywe na post. Kama Git push itakataa, rekebisha login, branch au hitilafu ya Git kisha bonyeza kuchapisha tena.

Push kwenda `main` huanzisha GitHub Actions kujenga na kuchapisha GitHub Pages. Push kwenda branch nyingine huhifadhi kazi GitHub lakini haiichapishi mpaka mabadiliko yaunganishwe `main`. Mara ya kwanza, kwenye GitHub Settings → Pages chagua **GitHub Actions** kama publishing source.

## Kuongeza kazi bila paneli

1. Weka picha zilizoidhinishwa na zilizobanwa kwenye `assets/works/`. Tumia WebP au JPEG inapowezekana.
2. Ongeza rekodi yenye `id` ya kipekee, jina, kundi, hali (`Completed`, `In Progress`, au `Concept`), muhtasari, maelezo ya picha na njia ya picha ndani ya `works.json`.
3. Jaza `objective`, `role`, `approach` na `result` kwa ushahidi uliopo. Acha sehemu tupu kama taarifa haijathibitishwa. Weka `featured: true` kuangazia kazi kwenye ukurasa wa mwanzo (kazi tatu za kwanza tu).
4. Makundi yanayotumika: `Software & Web`, `Networking & Infrastructure`, `CCTV & Security Systems`, `IT Support & Field Operations`, `Documentation, Reports & Training`, na `Graphic Design`.
5. Endesha `npm run build` kutengeneza kurasa zinazoweza kushirikishwa chini ya `projects/<id>/`.

## Build na uhakiki

- `npm run build` hutengeneza case study za kila mradi.
- `npm run build:site` huandaa faili za umma ndani ya `_site/`.
- `npm run preview` hutoa tovuti ya kawaida kwenye `http://localhost:4173`.
- `npm run admin` huwasha paneli binafsi ya uhariri na uchapishaji kwenye localhost.

## Maudhui yaliyopo na faragha

Gallery ina kazi 9 zilizopo, ikiwemo michoro 8 na Wapambanaji VICOBA kulingana na maudhui ya umma ya GitHub. Hakuna takwimu wala madai ya deployment yaliyothibitishwa kwa VICOBA. Wasifu umetumia CV iliyokuwepo. Hakukuwa na ushahidi wa umma wa miradi ya hospitali, CCTV, mitandao au nyaraka za IT kwenye nakala ya portfolio.

Usichapishe data za wagonjwa au wanachama, credentials, maelezo ya mtandao wa ndani, taarifa za uendeshaji wa hospitali, au kazi ya mteja bila idhini. Kazi unazopush kwenye `main` na GitHub Pages huwa za umma.

## Yaliyohitaji ukaguzi wako kabla ya kutangaza

- Thibitisha kama “Mosalum Digital” ndiyo jina la biashara unalopendelea. Ni chapa ya kazi na haimaanishi kampuni imesajiliwa.
- Thibitisha namba ya WhatsApp/Simu na upatikanaji wa huduma eneo ulilotaja.
- Kagua CV ya umma kwa maelezo ya wadhamini na tumia nakala iliyoidhinishwa.
- Hakiki link za wasifu na ongeza barua pepe ya huduma au domain ya umma ikipatikana.
