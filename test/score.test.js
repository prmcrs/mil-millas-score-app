const assert=require('node:assert/strict');const {test}=require('node:test');const S=require('../score');
test('score basics',()=>{const h=S.hand(['A'],{A_recorrido:1000,A_seguridades:4,A_viajeCompleto:true,A_bonus4seguridades:true},true);assert.equal(h.A_puntos,2100)});
test('invalid mileage',()=>assert.throws(()=>S.hand(['A'],{A_recorrido:30},true)));
test('four safeties required for bonus',()=>assert.throws(()=>S.hand(['A'],{A_recorrido:0,A_bonus4seguridades:true},true)));
test('tie at threshold',()=>{const h=S.hand(['A','B'],{A_recorrido:1000,B_recorrido:1000},true);const g={participantes:['A','B'],manos:[h,h,h,h,h]};assert.deepEqual(S.winner(g),['A','B'])});
test('no winner before threshold',()=>assert.deepEqual(S.winner({participantes:['A'],manos:[]}),[]));
test('legacy boolean false stays false',()=>assert.equal(S.hand(['A'],{A_recorrido:0,A_tk:'false'},true).A_puntos,0));
