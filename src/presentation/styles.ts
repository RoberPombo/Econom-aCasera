const btnBase = "cursor-pointer px-3 py-2 text-[0.95rem] text-white hover:opacity-90";

export const btn = `${btnBase} rounded-lg bg-primary`;
export const btnSecondary = `${btnBase} rounded-lg bg-muted`;
export const btnDanger = `${btnBase} rounded-lg bg-[#dc2626]`;

export const btnGhost = `${btnBase} rounded-lg border border-line bg-surface text-body`;
export const btnGhostActive = `${btnBase} rounded-lg border border-primary bg-primary text-white`;

export const btnAction = `${btnBase} rounded-lg mr-1 px-2 py-1`;
export const btnItem = `${btnBase} rounded-lg ml-1 px-2 py-1 text-[0.8rem]`;

const inputBase = "rounded-lg border border-line bg-surface p-2 text-[0.95rem] text-body";
export const input = `${inputBase} w-full`;
export const inputInline = `${inputBase} w-auto min-w-[150px] flex-1 max-mobile:w-full`;

export const label = "text-[0.9rem] text-muted";

export const section = "mb-6 rounded-lg bg-surface p-4 shadow-card";
export const sectionTitle = "mt-0 text-[1.15rem] font-bold";

export const tableWrap = "overflow-x-auto";
export const table = "w-full border-collapse text-[0.95rem]";
export const th = "border-b border-line p-2.5 text-left font-semibold text-muted";
export const td = "border-b border-line p-2.5 text-left";

export const income = "font-semibold text-income";
export const expense = "font-semibold text-expense";

export const categoryGrid = "mt-4 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6";
export const listReset = "m-0 list-none p-0";
export const listItem = "flex items-center justify-between border-b border-line py-1.5";
export const listItemInactive = "opacity-50 line-through";

export const inlineForm = "mb-4 flex flex-wrap gap-2 max-mobile:flex-col";
export const formRow = "mb-3 grid grid-cols-[100px_1fr] items-center gap-2 max-mobile:grid-cols-1";
export const formActions = "mt-4 flex gap-2";

export const hint = "mt-4 text-[0.85rem] text-muted";

export const modalOverlay = "fixed inset-0 z-[1000] flex items-center justify-center bg-black/50";
export const modal = "w-[90%] max-w-[600px] rounded-lg bg-surface p-6 shadow-card";
export const modalActions = "mt-4 flex flex-wrap gap-2";
export const modalBtn = `${btn} min-w-[140px] flex-1`;
export const modalBtnSecondary = `${btnSecondary} min-w-[140px] flex-1`;
export const modalBtnDanger = `${btnDanger} min-w-[140px] flex-1`;

export const importResult = "mt-4 rounded-lg border border-line bg-surface p-3";

export const app = "mx-auto min-h-screen max-w-[1000px] p-4";
export const header = "mb-4 flex flex-wrap items-center justify-between gap-4 max-mobile:flex-col max-mobile:items-start";
export const headerTitle = "m-0 text-2xl font-bold";
export const yearSelector = "flex items-center gap-2 text-xl font-semibold";
export const yearBtn = btnGhost;
export const themeToggle = `${btnBase} rounded-lg border border-line bg-surface px-2.5 py-1.5 text-body`;
export const iconGroup = "flex items-center gap-1";
export const iconBtn = `${btnBase} rounded-lg border border-line bg-surface px-2.5 py-1.5 text-body`;
export const monthGrid = "mb-4 flex flex-wrap items-center gap-2";
export const monthBtn = `${btnBase} rounded-lg border border-line bg-surface text-[0.85rem] text-body`;
export const monthBtnActive = `${btnBase} rounded-lg border border-primary bg-primary text-[0.85rem] text-white`;
export const chartGrid = "mb-6 grid grid-cols-2 gap-4 max-mobile:grid-cols-1";
export const dbInfo = section;
export const dbInfoHint = "my-1";
