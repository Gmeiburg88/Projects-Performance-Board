import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const months = [[1,"Mar",8,10,12,8],[2,"Apr",16,20,24,16],[3,"May",24,30,36,24],[4,"Jun",32,40,48,0],[5,"Jul",40,50,60,0],[6,"Aug",48,60,72,0],[7,"Sep",56,70,84,0],[8,"Oct",64,80,96,0],[9,"Nov",72,90,108,0],[10,"Dec",80,100,120,0],[11,"Jan",88,110,132,0],[12,"Feb",96,120,144,0]] as const;
  for (const [monthOrder, monthLabel, minimumTarget, target, stretchTarget, actual] of months) {
    await prisma.monthlyTarget.upsert({ where: { monthOrder }, update: { monthLabel, minimumTarget, target, stretchTarget, actual }, create: { monthOrder, monthLabel, minimumTarget, target, stretchTarget, actual } });
  }
  const teams = [["joanne","Joanne",46,-54,1,false],["karel-werner","Karel / Werner",51,-49,2,false],["wessel-kerron","Wessel / Kerron",22,-78,3,false],["francois","Francois",87,-13,4,false],["christine","Christine",51,-49,5,false],["ivan","Ivan",84,-16,6,false],["ukwazi","Ukwazi",55,-45,999,true]] as const;
  for (const [id, name, achievementPct, variancePct, sortOrder, isCompanyTotal] of teams) {
    await prisma.team.upsert({ where: { id }, update: { name, achievementPct, variancePct, sortOrder, isCompanyTotal }, create: { id, name, achievementPct, variancePct, sortOrder, isCompanyTotal } });
  }
  const projects = [["umk","UMK","Karel dK",72,"Active",1],["jhonnagiri","Jhonnagiri","Werner S",46,"Active",2],["grassvalley","Grassvalley","Werner S",88,"Active",3],["anglo","Anglo","Karel dK",31,"Active",4],["makuutu","Makuutu","Francois",57,"Active",5],["zulu-project","Zulu Project","Ivan",91,"Active",6],["scoping-update","Scoping Update","Joanne",24,"Active",7]] as const;
  for (const [id, name, ipm, progress, status, sortOrder] of projects) {
    await prisma.project.upsert({ where: { id }, update: { name, ipm, progress, status, sortOrder }, create: { id, name, ipm, progress, status, sortOrder } });
  }
}
main().then(async()=>{await prisma.$disconnect();}).catch(async(e)=>{console.error(e);await prisma.$disconnect();process.exit(1);});
