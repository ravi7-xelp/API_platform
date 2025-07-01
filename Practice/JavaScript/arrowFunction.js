//  find area and perimeter of rectangle using the arrow functions/ fat arrow functions.
const areaOfRectangle = (l, w) => Number(l) * Number(w);
const perimeterOfRectangle = (l, w) => 2 * (Number(l) + Number(w));

console.log(`Area of rectangle: ${areaOfRectangle(23, 233)}`);
console.log(`Perimeter of rectangle: ${perimeterOfRectangle(23,233)}`);

// Create Users fucntion using fucntion expression.

const createUsers = function (users, age, isAdmin) {
    return {
        users: users,
        age: age,
        isAdmin: isAdmin,
    };
};

// Create Users fucntion using arrow function. 
// Arrow functions to return back an object
const createTheUser = (users, age, isAdmin) => ({
    users: users,
    age: age,
    isAdmin: isAdmin,
})

// if the key and value has the same name i.e; variable and key word are same u can write above function as bellow

const createUser = (users, age, isAdmin) => ({
    users,
    age,
    isAdmin,
})

let jhon = createUser("M. John", 23, true);

console.log(jhon);

const obj = {
    x: 10,
    y: 20,
    addZ1(z) { // using method 
        return this.x + this.y + z;
    }, //addz(5) --> 10 + 20 + 5 = 35 --> result of addz function. //

    addZ2: (z)=>{ // using arrow function
      return this.x + this.y + z  
    }, 
    /* return NaN as result
     Because the this inside the arrow function is simply borrowed from it's parent scope which happens to be window and no the object
*/
    
    // to work this in the arrow function we need a function which returns the arrow function.

    addZ3() { // function to return arrow function 
        return (z) => this.x + this.y + z;
    }// returns the arrow function which accepts z and return the sum of the values
}

console.log(obj.addZ1(5)); // result = 35
console.log(obj.addZ2(5)); // result = NaN
let addZ3Fn = obj.addZ3(); // A function that add z to the sum of this.x and this.y
console.log(addZ3Fn(5)); // result = 35
