// // let list1 = [57424, 54060, 44870, 41493, 80409, 56010, 44306, 72892, 62206, 60172, 60591, 59996, 59264, 59429, 59427, 58243, 58242, 57733, 57667, 58244, 57111, 56009, 55576, 55997, 55463, 53581, 54266, 52486, 75186, 51537, 50961, 49419, 49417, 44090, 58245, 61070, 54872, 61692, 60574, 61687, 61072, 59948, 60565, 58776, 58761, 59383, 58240, 56584, 57619, 54695, 55389, 54871, 53321, 53757, 52124, 70990, 51523, 50445, 49889, 49414, 46239, 46400, 44092];
// // let list2 = [59948, 58242, 55463, 57667, 52124, 62206, 61687, 54872, 72892, 54060, 70990, 51537, 49417, 44090, 60172, 50445, 57733, 46400, 59429, 49419, 60574, 51537, 49417, 44090, 60172, 50445, 57733, 46400, 59429, 49419, 54695, 49889, 80409, 58242, 55463, 57667, 52124, 62206, 61687, 54872, 72892, 54060, 60565, 49414, 54266, 46239, 52486, 56584, 59948, 53581, 50961, 75186, 61070, 53757, 44306, 59383, 51523, 55576, 55389, 58245, 59996, 44092, 56009];

// // function checkLists(list1, list2) {
// //     let present = true;
// //     let notPresentInList1 = [];
// //     let notPresentInList2 = [];

// //     list1.forEach(item => {
// //         if (!list2.includes(item)) {
// //             present = false;
// //             notPresentInList2.push(item);
// //         }
// //     });

// //     list2.forEach(item => {
// //         if (!list1.includes(item)) {
// //             notPresentInList1.push(item);
// //         }
// //     });

// //     if (present) {
// //         console.log("All items in list1 are present in list2.");
// //     } else {
// //         console.log("Items not present in list2:", notPresentInList2);
// //         console.log("Items not present in list1:", notPresentInList1);
// //     }
// // }

// // checkLists(list1, list2);

// // let list1 = [
// //   57424,
// //   54060,
// //   44870,
// //   41493,
// //   80409,
// //   56010,
// //   44306,
// //   72892,
// //   62206,
// //   60172,
// //   60591,
// //   59996,
// //   59264,
// //   59429,
// //   59427,
// //   58243,
// //   58242,
// //   57733,
// //   57667,
// //   58244,
// //   57111,
// //   56009,
// //   55576,
// //   55997,
// //   55463,
// //   53581,
// //   54266,
// //   52486,
// //   75186,
// //   51537,
// //   50961,
// //   49419,
// //   49417,
// //   44090,
// //   58245,
// //   61070,
// //   54872,
// //   61692,
// //   60574,
// //   61687,
// //   61072,
// //   59948,
// //   60565,
// //   58776,
// //   58761,
// //   59383,
// //   58240,
// //   56584,
// //   57619,
// //   54695,
// //   55389,
// //   54871,
// //   53321,
// //   53757,
// //   52124,
// //   70990,
// //   51523,
// //   50445,
// //   49889,
// //   49414,
// //   46239,
// //   46400,
// //   44092
// // ];
// // let list2 = [
// //   59948,
// //   58242,
// //   55463,
// //   57667,
// //   52124,
// //   62206,
// //   61687,
// //   54872,
// //   72892,
// //   54060,
// //   70990,
// //   51537,
// //   49417,
// //   44090,
// //   60172,
// //   50445,
// //   57733,
// //   46400,
// //   59429,
// //   49419,
// //   60574,
// //   51537,
// //   49417,
// //   44090,
// //   60172,
// //   50445,
// //   57733,
// //   46400,
// //   59429,
// //   49419,
// //   54695,
// //   49889,
// //   80409,
// //   58242,
// //   55463,
// //   57667,
// //   52124,
// //   62206,
// //   61687,
// //   54872,
// //   72892,
// //   54060,
// //   60565,
// //   49414,
// //   54266,
// //   46239,
// //   52486,
// //   56584,
// //   59948,
// //   53581,
// //   50961,
// //   75186,
// //   61070,
// //   53757,
// //   44306,
// //   59383,
// //   51523,
// //   55576,
// //   55389,
// //   58245,
// //   59996,
// //   44092,
// //   56009
// // ];

// // function checkLists(list1, list2) {
// //   let present = true;
// //   let notPresentInList1 = [];
// //   let notPresentInList2 = [];

// //   list1.forEach(item => {
// //     if (!list2.includes(item)) {
// //       present = false;
// //       notPresentInList2.push(item);
// //     }
// //   });

// //   list2.forEach(item => {
// //     if (!list1.includes(item)) {
// //       notPresentInList1.push(item);
// //     }
// //   });

// //   if (present) {
// //     console.log("All items in list1 are present in list2.");
// //   } else {
// //     if (notPresentInList1.length > 0) {
// //       console.log(
// //         "Items not present in list2 but in list1:",
// //         notPresentInList1
// //       );
// //     }
// //     if (notPresentInList2.length > 0) {
// //       console.log(
// //         "Items not present in list1 but in list2:",
// //         notPresentInList2
// //       );
// //     }
// //   }
// // }

// // checkLists(list1, list2);

let list1 = [
  57424,
  54060,
  44870,
  41493,
  80409,
  56010,
  44306,
  72892,
  62206,
  60172,
  60591,
  59996,
  59264,
  59429,
  59427,
  58243,
  58242,
  57733,
  57667,
  58244,
  57111,
  56009,
  55576,
  55997,
  55463,
  53581,
  54266,
  52486,
  75186,
  51537,
  50961,
  49419,
  49417,
  44090,
  58245,
  61070,
  54872,
  61692,
  60574,
  61687,
  61072,
  59948,
  60565,
  58776,
  58761,
  59383,
  58240,
  56584,
  57619,
  54695,
  55389,
  54871,
  53321,
  53757,
  52124,
  70990,
  51523,
  50445,
  49889,
  49414,
  46239,
  46400,
  44092
];
let list2 = [
  59948,
  58242,
  55463,
  57667,
  52124,
  62206,
  61687,
  54872,
  72892,
  54060,
  70990,
  51537,
  49417,
  44090,
  60172,
  50445,
  57733,
  46400,
  59429,
  49419,
  60574,
  51537,
  49417,
  44090,
  60172,
  50445,
  57733,
  46400,
  59429,
  49419,
  54695,
  49889,
  80409,
  58242,
  55463,
  57667,
  52124,
  62206,
  61687,
  54872,
  72892,
  54060,
  60565,
  49414,
  54266,
  46239,
  52486,
  56584,
  59948,
  53581,
  50961,
  75186,
  61070,
  53757,
  44306,
  59383,
  51523,
  55576,
  55389,
  58245,
  59996,
  44092,
  56009
];

// // function checkLists(list1, list2) {
// //   let present = true;
// //   let notPresentInList1 = [];
// //   let notPresentInList2 = [];

// //   list1.forEach(item => {
// //     if (!list2.includes(item)) {
// //       present = false;
// //       notPresentInList2.push(item);
// //     }
// //   });

// //   list2.forEach(item => {
// //     if (!list1.includes(item)) {
// //       notPresentInList1.push(item);
// //     }
// //   });

// //   if (present) {
// //     console.log("All items in list1 are present in list2.");
// //   } else {
// //     if (notPresentInList1.length > 0) {
// //       console.log(
// //         "Items not present in list2 but in list1:",
// //         notPresentInList1
// //       );
// //     }
// //     if (notPresentInList2.length > 0) {
// //       console.log(
// //         "Items not present in list1 but in list2:",
// //         notPresentInList2
// //       );
// //     }
// //   }

// //   return {
// //     notPresentInList1: notPresentInList1,
// //     notPresentInList2: notPresentInList2
// //   };
// // }

// // let result = checkLists(list1, list2);
// // console.log("Items not present in list1:", result.notPresentInList1);
// // console.log("list1 length:", list1.length);
// // console.log("list2 length:", list2.length);


let provideSheetData = [];
let webPageData = [59948, 58242, 55463, 57667, 52124, 62206, 61687, 54872, 72892, 54060, 70990, 51537, 49417, 44090, 60172, 50445, 57733, 46400, 59429, 49419, 60574, 51537, 49417, 44090, 60172, 50445, 57733, 46400, 59429, 49419, 54695, 49889, 80409, 58242, 55463, 57667, 52124, 62206, 61687, 54872, 72892, 54060, 60565, 49414, 54266, 46239, 52486, 56584, 59948, 53581, 50961, 75186, 61070, 53757, 44306, 59383, 51523, 55576, 55389, 58245, 59996, 44092, 44092];

// function checkPresence(provideSheetData, webPageData) {
//   let allPresent = true;
//   let notPresent = [];

//   provideSheetData.forEach(item => {
//     if (!webPageData.includes(item)) {
//       allPresent = false;
//       notPresent.push(item);
//     }
//   });

//   return { allPresent, notPresent };
// }

// let { allPresent, notPresent } = checkPresence(provideSheetData, webPageData);

// if (allPresent) {
//   console.log("All items of provideSheetData are present in webPageData.");
// } else {
//   console.log(
//     "Some items of provideSheetData are not present in webPageData:",
//     notPresent
//   );
// }

function checkPresenceAndRepetition(provideSheetData, webPageData) {
  let allPresent = true;
  let notPresent = [];
  let repeatedItems = [];

  provideSheetData.forEach(item => {
    if (!webPageData.includes(item)) {
      allPresent = false;
      notPresent.push(item);
    }
  });

  webPageData.forEach(item => {
    if (webPageData.indexOf(item) !== webPageData.lastIndexOf(item)) {
      if (!repeatedItems.includes(item)) {
        repeatedItems.push(item);
      }
    }
  });

  return { allPresent, notPresent, repeatedItems };
}

let { allPresent, notPresent, repeatedItems } = checkPresenceAndRepetition(
  provideSheetData,
  webPageData
);

if (allPresent) {
  console.log("All items of provideSheetData are present in webPageData.");
} else {
  console.log(
    "Some items of provideSheetData are not present in webPageData:",
    notPresent
  );
  console.log(
    "Items from webPageData not present in provideSheetData:",
    webPageData.filter(item => !provideSheetData.includes(item)).length
  );
}

if (repeatedItems.length > 0) {
  console.log("Repeated items in webPageData:", repeatedItems.length);
} else {
  console.log("No repeated items in webPageData.");
}

// 