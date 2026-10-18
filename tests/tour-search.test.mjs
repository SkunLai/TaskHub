import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearchText, matchesTourSearch, matchesTourSchedule, hasScheduleFilters } from '../src/tour-search.mjs';
import { todayVietnam } from '../src/dates.mjs';

const tour={title:'DEMO · Hà Nội - Đà Nẵng',destination:'Đà Nẵng - Hội An',departure:'2026-11-15',capacity:30,reserved:22};
test('Vietnamese tour search accepts missing accents, case and whitespace without ignoring destination',()=>{
  assert.equal(normalizeSearchText('  ĐÀ   NẴNG  '),'da nang');
  assert.equal(matchesTourSearch(tour,'  da nang  ',''),true);
  assert.equal(matchesTourSearch({...tour,code:'TOUR-01'},'tour-01',''),true);
  assert.equal(matchesTourSearch(tour,'ha noi','Phú Quốc'),false);
});
test('departure filters include boundary dates and reject inverted ranges',()=>{
  assert.equal(matchesTourSchedule(tour,{from:'2026-11-15',to:'2026-11-15'}),true);
  assert.equal(matchesTourSchedule(tour,{from:'2026-11-16'}),false);
  assert.equal(matchesTourSchedule(tour,{to:'2026-11-14'}),false);
  assert.equal(matchesTourSchedule(tour,{from:'2026-11-20',to:'2026-11-10'}),false);
  assert.equal(hasScheduleFilters({}),false);assert.equal(hasScheduleFilters({availableOnly:true}),true);
});
test('available-only excludes departed, full and unknown stock; includes departure today',()=>{
  const filters={availableOnly:true};
  assert.equal(matchesTourSchedule(tour,filters,'2026-11-15'),true);
  assert.equal(matchesTourSchedule(tour,filters,'2026-11-16'),false);
  assert.equal(matchesTourSchedule({...tour,reserved:30},filters,'2026-11-15'),false);
  assert.equal(matchesTourSchedule({title:'Reference tour'},filters,'2026-11-15'),false);
  assert.equal(matchesTourSchedule({departure:tour.departure,capacity:30,reserved:null},filters,'2026-11-15'),false);
});
test('Vietnam calendar day remains correct at UTC day boundary',()=>{
  assert.equal(todayVietnam(new Date('2026-10-18T16:59:59Z')),'2026-10-18');
  assert.equal(todayVietnam(new Date('2026-10-18T17:00:00Z')),'2026-10-19');
});
