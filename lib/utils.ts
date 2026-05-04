export function progressTone(value:number){if(value>=80)return"bg-emerald-500";if(value>=50)return"bg-amber-500";return"bg-red-500";}
export function rowTone(value:number){if(value>=80)return"border-emerald-100 bg-emerald-50/60";if(value>=50)return"border-amber-100 bg-amber-50/60";return"border-red-100 bg-red-50/60";}
export function varianceTone(value:number){if(value>=0)return"text-emerald-700 bg-emerald-50";if(value>=-15)return"text-amber-700 bg-amber-50";return"text-red-700 bg-red-50";}
export function clampPercent(value:number){return Math.max(0,Math.min(100,value));}
