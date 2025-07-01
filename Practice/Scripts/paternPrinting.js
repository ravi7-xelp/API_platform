let i = 1,
    j = 1;
    let str = "";

while (i < 6) {
    if (j <= 5) {
        str = str + i + j;

    j++;
  } else {
      str = " ";
      console.log(str);
    i++;
    j = 1;
    }
}
