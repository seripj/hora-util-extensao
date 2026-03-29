/* =============================================
   HoraÚtil — popup.js
   Datepicker customizado (PT/EN)
   Feriados calculados automaticamente (BR).
   ============================================= */
"use strict";

// ── TRADUÇÕES ─────────────────────────────────
const I18N = {
  pt: {
    tab_mes: "Por Mês", tab_periodo: "Por Período",
    label_mes: "Mês / Ano", label_inicio: "Data Início", label_fim: "Data Fim",
    label_folgas: "🏖️ Folgas + Feriados", label_horas: "⏰ Horas/Dia",
    divider_resultados: "resultados",
    res_uteis_label: "Dias Úteis no Período",
    res_corridos_label: "Dias Corridos", res_uteis_hoje_label: "Úteis até Hoje",
    res_uteis_hoje_sub: "dias trabalhados", res_horas_total_label: "Horas a Baixar",
    res_horas_total_sub: "total do período", res_horas_hoje_label: "Horas até Hoje",
    footer_data: "Data atual:",
    sem_desconto: "sem descontos aplicados", ate_hoje: "até hoje",
    ate_data: (d) => `até ${d}`, fim_do_dia: "fim do dia de hoje",
    dias_uteis: (n) => `${n} dia${n !== 1 ? "s" : ""} útei${n !== 1 ? "s" : ""}`,
    feriado: (n) => `${n} feriado${n !== 1 ? "s" : ""}`,
    ajustado: (n) => `ajustado para ${n}`,
    feriados_label: "Feriados:",
    meses: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
    meses_abrev: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],
    dias_semana: ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],
    placeholder_mes: "Selecione o mês",
    placeholder_data: "Selecione a data",
  },
  en: {
    tab_mes: "By Month", tab_periodo: "By Period",
    label_mes: "Month / Year", label_inicio: "Start Date", label_fim: "End Date",
    label_folgas: "🏖️ Days Off + Holidays", label_horas: "⏰ Hours/Day",
    divider_resultados: "results",
    res_uteis_label: "Working Days in Period",
    res_corridos_label: "Calendar Days", res_uteis_hoje_label: "Working Days to Date",
    res_uteis_hoje_sub: "days worked", res_horas_total_label: "Hours to Log",
    res_horas_total_sub: "total for period", res_horas_hoje_label: "Hours to Date",
    footer_data: "Today:",
    sem_desconto: "no discounts applied", ate_hoje: "through today",
    ate_data: (d) => `through ${d}`, fim_do_dia: "end of today",
    dias_uteis: (n) => `${n} working day${n !== 1 ? "s" : ""}`,
    feriado: (n) => `${n} holiday${n !== 1 ? "s" : ""}`,
    ajustado: (n) => `adjusted to ${n}`,
    feriados_label: "Holidays:",
    meses: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    meses_abrev: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    dias_semana: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    placeholder_mes: "Select month",
    placeholder_data: "Select date",
  },
};

let lang = "pt";
const t = (key, ...args) => {
  const val = I18N[lang][key];
  return typeof val === "function" ? val(...args) : (val ?? key);
};

function applyTranslations() {
  document.getElementById("html-root").lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  // Re-render datepicker triggers text
  refreshTriggerLabels();
}

// ── FERIADOS BR ───────────────────────────────
function calcularPascoa(ano) {
  const a=ano%19,b=Math.floor(ano/100),c=ano%100,d=Math.floor(b/4),e=b%4;
  const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30;
  const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  return new Date(ano, Math.floor((h+l-7*m+114)/31)-1, ((h+l-7*m+114)%31)+1);
}
function addDays(d,n){const r=new Date(d);r.setDate(r.getDate()+n);return r;}

function buildHolidaySet(inicio, fim) {
  const anos=new Set();
  for(let y=inicio.getFullYear();y<=fim.getFullYear();y++) anos.add(y);
  const todas=[];
  anos.forEach((ano)=>{
    const p=calcularPascoa(ano);
    [[1,1,"Confraternização Universal"],[4,21,"Tiradentes"],[5,1,"Dia do Trabalho"],
     [9,7,"Independência do Brasil"],[10,12,"Nossa Senhora Aparecida"],
     [11,2,"Finados"],[11,15,"Proclamação da República"],[12,25,"Natal"]]
      .forEach(([m,d,n])=>todas.push({data:new Date(ano,m-1,d),nome:n}));
    [[-48,"Carnaval (2ª-feira)"],[-47,"Carnaval (3ª-feira)"],[-2,"Sexta-feira Santa"],
     [0,"Páscoa"],[60,"Corpus Christi"]]
      .forEach(([off,n])=>todas.push({data:addDays(p,off),nome:n}));
  });
  const map=new Map();
  todas.forEach(({data,nome})=>{
    const dow=data.getDay();
    if(data>=inicio&&data<=fim&&dow!==0&&dow!==6) map.set(toISO(data),nome);
  });
  return map;
}

// ── UTILITÁRIOS ───────────────────────────────
function toISO(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function toBR(d){return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;}
function toEN(d){return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
function formatDate(d){return lang==="pt"?toBR(d):toEN(d);}
function parseDate(str){const[y,m,day]=str.split("-").map(Number);return new Date(y,m-1,day);}
function isSameDay(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}

function contarDiasUteisBase(inicio,fim){
  let c=0,cur=new Date(inicio);
  while(cur<=fim){const d=cur.getDay();if(d!==0&&d!==6)c++;cur.setDate(cur.getDate()+1);}
  return c;
}
function contarDiasCorridos(inicio,fim){return Math.round((fim-inicio)/86400000)+1;}

// ── ESTADO ────────────────────────────────────
let activeTab = "mes";
let folgasEditadoManualmente = false;

// Datepicker state
let dpOpen = null; // "mes" | "inicio" | "fim" | null
let dpViewYear = new Date().getFullYear();
let dpViewMonth = new Date().getMonth(); // para o picker de dias

// Valores selecionados
let selMesAno   = null; // { year, month } (0-indexed)
let selInicio   = null; // Date
let selFim      = null; // Date
// qual está sendo selecionado no período (0=inicio, 1=fim)
let periodoStep = 0;

const $ = (id) => document.getElementById(id);
function setResult(id,val){const el=$(id);if(el)el.textContent=val??"—";}

// ── DATEPICKER RENDER ─────────────────────────

function openDP(which) {
  const hoje = new Date();
  if (which === "mes") {
    dpViewYear = selMesAno ? selMesAno.year : hoje.getFullYear();
    dpOpen = "mes";
  } else {
    // periodo
    dpOpen = which;
    periodoStep = which === "inicio" ? 0 : 1;
    const ref = which === "inicio" ? selInicio : selFim;
    if (ref) { dpViewYear = ref.getFullYear(); dpViewMonth = ref.getMonth(); }
    else      { dpViewYear = hoje.getFullYear(); dpViewMonth = hoje.getMonth(); }
  }
  renderDP();
  $("dp-popup").classList.remove("hidden");
  // Position popup below active trigger
  positionDP(which);
  document.querySelectorAll(".dp-trigger").forEach(b => b.classList.remove("open"));
  $(`btn-${which}`).classList.add("open");
}

function closeDP() {
  dpOpen = null;
  $("dp-popup").classList.add("hidden");
  document.querySelectorAll(".dp-trigger").forEach(b => b.classList.remove("open"));
}

function positionDP(which) {
  const popup = $("dp-popup");
  const trigger = $(`btn-${which}`);
  const appRect = document.querySelector(".app").getBoundingClientRect();
  const trigRect = trigger.getBoundingClientRect();
  const top = trigRect.bottom - appRect.top + 4;
  popup.style.top = top + "px";
}

function renderDP() {
  const popup = $("dp-popup");
  if (!dpOpen) return;
  if (dpOpen === "mes") renderMonthPicker(popup);
  else renderDayPicker(popup);
}

function renderMonthPicker(popup) {
  const hoje = new Date();
  const meses = I18N[lang].meses_abrev;

  let html = `<div class="dp-nav">
    <button class="dp-nav-btn" id="dp-prev">‹</button>
    <span class="dp-nav-title">${dpViewYear}</span>
    <button class="dp-nav-btn" id="dp-next">›</button>
  </div>
  <div class="dp-months">`;

  for (let m = 0; m < 12; m++) {
    const isSel = selMesAno && selMesAno.year === dpViewYear && selMesAno.month === m;
    const isNow = hoje.getFullYear() === dpViewYear && hoje.getMonth() === m;
    const cls = ["dp-month-btn", isSel ? "selected" : "", isNow && !isSel ? "today" : ""].filter(Boolean).join(" ");
    html += `<button class="${cls}" data-m="${m}">${meses[m]}</button>`;
  }
  html += `</div>`;
  popup.innerHTML = html;

  $("dp-prev").onclick = () => { dpViewYear--; renderDP(); };
  $("dp-next").onclick = () => { dpViewYear++; renderDP(); };

  popup.querySelectorAll(".dp-month-btn").forEach(btn => {
    btn.onclick = () => {
      const m = parseInt(btn.dataset.m);
      selMesAno = { year: dpViewYear, month: m };
      // Sync hidden input
      $("input-mes").value = `${dpViewYear}-${String(m+1).padStart(2,"0")}`;
      refreshTriggerLabels();
      closeDP();
      folgasEditadoManualmente = false;
      calcular();
    };
  });
}

function renderDayPicker(popup) {
  const hoje = new Date();
  const meses = I18N[lang].meses;
  const diasSem = I18N[lang].dias_semana;

  const titulo = `${meses[dpViewMonth]} ${dpViewYear}`;

  let html = `<div class="dp-nav">
    <button class="dp-nav-btn" id="dp-prev">‹</button>
    <span class="dp-nav-title">${titulo}</span>
    <button class="dp-nav-btn" id="dp-next">›</button>
  </div>
  <div class="dp-dow-row">`;
  diasSem.forEach(d => { html += `<div class="dp-dow">${d}</div>`; });
  html += `</div><div class="dp-days">`;

  const firstDay = new Date(dpViewYear, dpViewMonth, 1);
  const lastDay  = new Date(dpViewYear, dpViewMonth + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun

  // Pad with prev month days
  const prevLast = new Date(dpViewYear, dpViewMonth, 0);
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(dpViewYear, dpViewMonth - 1, prevLast.getDate() - i);
    html += dayCell(d, hoje, true);
  }
  // Current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = new Date(dpViewYear, dpViewMonth, day);
    html += dayCell(d, hoje, false);
  }
  // Pad end
  const endDow = lastDay.getDay();
  for (let i = 1; i <= (6 - endDow); i++) {
    const d = new Date(dpViewYear, dpViewMonth + 1, i);
    html += dayCell(d, hoje, true);
  }

  html += `</div>`;
  popup.innerHTML = html;

  $("dp-prev").onclick = () => {
    dpViewMonth--;
    if (dpViewMonth < 0) { dpViewMonth = 11; dpViewYear--; }
    renderDP();
  };
  $("dp-next").onclick = () => {
    dpViewMonth++;
    if (dpViewMonth > 11) { dpViewMonth = 0; dpViewYear++; }
    renderDP();
  };

  popup.querySelectorAll(".dp-day[data-iso]").forEach(cell => {
    cell.onclick = () => {
      const d = parseDate(cell.dataset.iso);
      if (dpOpen === "inicio" || (dpOpen === "fim" && !selInicio)) {
        selInicio = d;
        // If fim is before new inicio, clear it
        if (selFim && selFim < selInicio) selFim = null;
        if (!selFim) { dpOpen = "fim"; dpViewYear = d.getFullYear(); dpViewMonth = d.getMonth(); renderDP(); positionDP("inicio"); }
        else { closeDP(); }
      } else { // fim
        if (selInicio && d < selInicio) {
          // swap
          selFim = selInicio;
          selInicio = d;
        } else {
          selFim = d;
        }
        closeDP();
      }
      syncPeriodoInputs();
      refreshTriggerLabels();
      folgasEditadoManualmente = false;
      calcular();
    };
  });
}

function dayCell(d, hoje, otherMonth) {
  const iso = toISO(d);
  const isToday = isSameDay(d, hoje);
  const isSelInicio = selInicio && isSameDay(d, selInicio);
  const isSelFim    = selFim    && isSameDay(d, selFim);
  const inRange = selInicio && selFim && d > selInicio && d < selFim;

  const cls = [
    "dp-day",
    otherMonth ? "other-month" : "",
    isToday && !isSelInicio && !isSelFim ? "today" : "",
    isSelInicio || isSelFim ? "selected" : "",
    inRange ? "in-range" : "",
  ].filter(Boolean).join(" ");

  return `<div class="${cls}" data-iso="${iso}">${d.getDate()}</div>`;
}

function syncPeriodoInputs() {
  $("input-inicio").value = selInicio ? toISO(selInicio) : "";
  $("input-fim").value    = selFim    ? toISO(selFim)    : "";
}

function refreshTriggerLabels() {
  // Mês
  const btnMesText = $("btn-mes-text");
  if (btnMesText) {
    if (selMesAno) {
      btnMesText.textContent = `${I18N[lang].meses[selMesAno.month]} ${selMesAno.year}`;
    } else {
      btnMesText.textContent = t("placeholder_mes");
    }
  }
  // Início
  const btnInicioText = $("btn-inicio-text");
  if (btnInicioText) btnInicioText.textContent = selInicio ? formatDate(selInicio) : t("placeholder_data");
  // Fim
  const btnFimText = $("btn-fim-text");
  if (btnFimText) btnFimText.textContent = selFim ? formatDate(selFim) : t("placeholder_data");
}

// ── PERÍODO UTILS ─────────────────────────────
function getPeriodo() {
  if (activeTab === "mes") {
    if (!selMesAno) return null;
    return {
      inicio: new Date(selMesAno.year, selMesAno.month, 1),
      fim:    new Date(selMesAno.year, selMesAno.month + 1, 0),
    };
  } else {
    if (!selInicio || !selFim) return null;
    if (selInicio > selFim) return null;
    return { inicio: selInicio, fim: selFim };
  }
}

// ── CÁLCULO ───────────────────────────────────
function calcular() {
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const periodo = getPeriodo();
  if (!periodo) return resetResults();
  const { inicio, fim } = periodo;

  const holidayMap = buildHolidaySet(inicio, fim);
  const qtdFeriados = holidayMap.size;
  if (!folgasEditadoManualmente) $("folgas").value = qtdFeriados;

  const folgas   = Math.max(0, parseInt($("folgas").value) || 0);
  const horasDia = Math.max(1, parseInt($("horas-dia").value) || 8);

  const diasUteisBase     = contarDiasUteisBase(inicio, fim);
  const diasUteisEfetivos = Math.max(0, diasUteisBase - folgas);
  const horasTotal        = diasUteisEfetivos * horasDia;

  const dentroDoPeriodo = hoje >= inicio && hoje <= fim;
  const dataBase = dentroDoPeriodo ? hoje : (hoje > fim ? fim : null);

  let diasCorridos=0, diasUteisHoje=0, horasHoje=0;
  if (dataBase) {
    diasCorridos  = contarDiasCorridos(inicio, dataBase);
    diasUteisHoje = Math.max(0, contarDiasUteisBase(inicio, dataBase) - folgas);
    horasHoje     = diasUteisHoje * horasDia;
  }

  setResult("res-uteis", diasUteisEfetivos);
  const partes = [t("dias_uteis", diasUteisBase)];
  if (qtdFeriados > 0) {
    const ferStr = t("feriado", qtdFeriados);
    partes.push(folgas !== qtdFeriados ? `${ferStr} (${t("ajustado", folgas)})` : ferStr);
  }
  $("res-uteis-sub").textContent = partes.length > 1
    ? `${partes[0]} − ${partes.slice(1).join(" − ")}`
    : t("sem_desconto");

  const infoEl = $("desconto-info");
  if (infoEl) {
    const nomes = [...holidayMap.values()].join(", ");
    infoEl.textContent = nomes ? `${t("feriados_label")} ${nomes}` : "";
  }

  setResult("res-corridos",   dataBase ? diasCorridos  : "—");
  setResult("res-uteis-hoje", dataBase ? diasUteisHoje : "—");
  if (dataBase) $("res-corridos-sub").textContent = dentroDoPeriodo ? t("ate_hoje") : t("ate_data", formatDate(fim));

  setResult("res-horas-total", `${horasTotal}h`);
  setResult("res-horas-hoje",  dataBase ? `${horasHoje}h` : "—");
  if (dataBase) $("res-horas-hoje-sub").textContent = dentroDoPeriodo ? t("fim_do_dia") : t("ate_data", formatDate(fim));

  try {
    chrome.storage.local.set({
      lang, activeTab,
      selMesAno, selInicio: selInicio ? toISO(selInicio) : null, selFim: selFim ? toISO(selFim) : null,
      folgas: $("folgas").value, horasDia: $("horas-dia").value, folgasEditadoManualmente,
    });
  } catch(_) {}
}

function resetResults() {
  ["res-uteis","res-corridos","res-uteis-hoje","res-horas-total","res-horas-hoje"].forEach(id=>setResult(id,"—"));
  const infoEl=$("desconto-info"); if(infoEl) infoEl.textContent="";
}

// ── INIT ──────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const hoje = new Date();

  // Default: mês atual
  selMesAno = { year: hoje.getFullYear(), month: hoje.getMonth() };

  // Idioma
  $("lang-select").addEventListener("change", () => {
    lang = $("lang-select").value;
    applyTranslations();
    $("data-hoje").textContent = formatDate(hoje);
    calcular();
  });

  // Tabs
  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTab = btn.dataset.tab;
      document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $("panel-mes").classList.toggle("hidden",     activeTab !== "mes");
      $("panel-periodo").classList.toggle("hidden", activeTab !== "periodo");
      closeDP();
      folgasEditadoManualmente = false;
      calcular();
    });
  });

  // Datepicker triggers
  $("btn-mes").addEventListener("click", (e) => {
    e.stopPropagation();
    dpOpen === "mes" ? closeDP() : openDP("mes");
  });
  $("btn-inicio").addEventListener("click", (e) => {
    e.stopPropagation();
    dpOpen === "inicio" ? closeDP() : openDP("inicio");
  });
  $("btn-fim").addEventListener("click", (e) => {
    e.stopPropagation();
    dpOpen === "fim" ? closeDP() : openDP("fim");
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!$("dp-popup").contains(e.target)) closeDP();
  });
  $("dp-popup").addEventListener("click", e => e.stopPropagation());

  // Steppers
  document.querySelectorAll(".step-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.target === "folgas") folgasEditadoManualmente = true;
      const input = $(btn.dataset.target);
      const val = parseInt(input.value) || 0;
      input.value = Math.min(parseInt(input.max)||99, Math.max(parseInt(input.min)||0, btn.dataset.op==="+" ? val+1 : val-1));
      calcular();
    });
  });

  $("folgas").addEventListener("input",  () => { folgasEditadoManualmente = true; calcular(); });
  $("folgas").addEventListener("change", () => { folgasEditadoManualmente = true; calcular(); });
  $("horas-dia").addEventListener("input",  calcular);
  $("horas-dia").addEventListener("change", calcular);

  // Restaura estado
  try {
    chrome.storage.local.get(
      ["lang","activeTab","selMesAno","selInicio","selFim","folgas","horasDia","folgasEditadoManualmente"],
      (data) => {
        if (data.lang) { lang = data.lang; $("lang-select").value = lang; }
        if (data.selMesAno) selMesAno = data.selMesAno;
        if (data.selInicio) selInicio = parseDate(data.selInicio);
        if (data.selFim)    selFim    = parseDate(data.selFim);
        if (data.folgas)    $("folgas").value    = data.folgas;
        if (data.horasDia)  $("horas-dia").value = data.horasDia;
        folgasEditadoManualmente = !!data.folgasEditadoManualmente;
        if (data.activeTab && data.activeTab !== "mes") {
          document.querySelector(`[data-tab="${data.activeTab}"]`)?.click();
        }
        applyTranslations();
        $("data-hoje").textContent = formatDate(hoje);
        refreshTriggerLabels();
        calcular();
      }
    );
  } catch(_) {
    applyTranslations();
    $("data-hoje").textContent = formatDate(hoje);
    refreshTriggerLabels();
    calcular();
  }
});
