import ComUtil from '../src/util/ComUtil';
import moment from 'moment-timezone';

//USAGE: $npm test

test('compareDate test', () => {
    let date1 = '2018-09-01';
    let date2 = '2018-10-01';

    let ret = ComUtil.compareDate(date1, date2);
    expect(ret).toBe(-1);
});

test('objectAttrCopy test', () => {
    let target = {a:1, b:2, c:3};
    let source =      {b:5, c:6, d:7};

    ComUtil.objectAttrCopy(target, source);

    expect(target.a).toBe(1);
    expect(target.b).toBe(5);
    expect(target.d).toBe(undefined);
});


test('sortDate test', () => {
    let array = [{a:1, b:'2018-09-01T15:00:00.000z', c:20180901}, {a:3, b:'2018-09-03T15:00:00.000z', c:20180903}, {a:2, b:'2018-09-02T15:00:00.000z', c:20180902} ];

    //sortNumber TEST
    ComUtil.sortNumber(array, 'c');

    expect(array[0].a).toBe(1);
    expect(array[1].a).toBe(2);
    expect(array[2].a).toBe(3);

    ComUtil.sortNumber(array, 'c', true);

    expect(array[0].a).toBe(3);
    expect(array[1].a).toBe(2);
    expect(array[2].a).toBe(1);

    //sortDate (String) TEST
    ComUtil.sortDate(array, 'b');

    expect(array[0].a).toBe(1);
    expect(array[1].a).toBe(2);
    expect(array[2].a).toBe(3);

    ComUtil.sortDate(array, 'b', true);

    expect(array[0].a).toBe(3);
    expect(array[1].a).toBe(2);
    expect(array[2].a).toBe(1);

});

/* SmartContract Test fail: MetaMask Problem
test('Set_Get test', () => {
    let storage = new SimpleStorageSC();
    storage.initContract('/SimpleStorageSC.json');


    storage.setValue(1);
    let ret = storage.getValue();
    expect(ret).toBe(1);
});
*/


