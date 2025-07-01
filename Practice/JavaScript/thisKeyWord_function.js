// 'use strict'
// The 'this' Keyword and Function Execution Context

/*
     the owner ship of the function can be switched and this ownership can be found using the 'this' keyword
     Depending on where you access the this keyword wether outside a function or inside it points to the contextt,
     the environment within which it's present.

     This can be used to store and access data with in the operational context
*/

// This key word out side a function

/*
     Outside a function "this" keyword a web browser points to the global window object
*/
// console.log(this)
console.log(this);

// This key word inside side a function
/* 
     Inside the fucntion, the 'this'keyword may point to the global scope if 'use strict' is not in place. Otherwise, it's set to undefined.
*/
const someFucnction = function (){
     return this;
}

// console.log(`with use strict "${someFucnction()}" we will get undefined as the out put` );
// console.log(`without use strictwe will get the widows data \n`+someFucnction())
console.log(someFucnction());

// This keyword in object 

/*
 when the function is part of an object the 'this' keyword points to the object allowing you to access the object's properties and values.

 But a stand-alone function can also be made to work in the context of a given object. In this case, we can rewrie a fucntion's 'this' context
 to an object thereby providing a direct mechanism to access the object's properties within the function.     
*/
/* The 'this' keyword points to the object allowing us to access the object's properties and values when the function is part of an object.*/

// QUESTION:

const person ={
     name: 'Jhon Mockery',
     age: 17,
     profession: 'Software Wizard',
     // sayHi: function(){
     //      return `Hi, my name Jhon Mockery`
     // }
     sayHi: function(){ //this is anonimous function
          return `Hi, my name ${this.name}. I'm ${this.age} years old and I'm a ${this.profession}`
     },
     canDrive() { // this is method {object short hand syntax}
          return this.age >= 18 ? "Candriver: yes":"Candriver: No";
     }
     
}

console.log(person.sayHi())
console.log(person.canDrive())
// rather than

// Adding function to an object    
person.myJob = function(){
     return `I work as ${this. profession}`;
}


console.log(person.myJob())

// -----------------------------------------------------------------------------------------------------------------------

// Create a Standallone functions that should operate with in the context of an object

const john ={
     age: 35,
     gender:'M',
     weight:78,
     height: 177.8,
};
const sarah = {
     age: 32,
     gender:'F',
     weight:68,
     height: 177.8, 
};
// Weight is in KG and Height is in CM

// Creating function name calcBmi which should calculate a person's  body mass index called BMI. 

const calcBmi = function(){
     return this.weight/ (this.height/100)**2
}

// Create fucntion that calculate the basil metabolic rate(BMR). 

const calcBmr = function(){
     if(this.gender ==='M'){
          return 66.47 + 13.47*this.weight + 5.003* this.height - 6.755* this.age;
     }else{
          return 655.1 + 9.563*this.weight + 1.85* this.height - 4.676* this.age;

     }
}

// this.weight , this.age, this.height doesn't belong to fucntion so they all return o/p as undefined:
try{
     console.log(calcBmi());
}catch (error){
     console.log(`ERROR ----> ${error}`);
}


/* Try to execute the above fucntion and some how point the fucntions this context to eitherof the objects present above
(i.e, jhon or sarah). In this way function would be able to read the weight,age,height values of the individual.
*/

// METHO-1 : Add our function to object: Eg bellow:
/*
jhon.calcBmi =calcBmi;

console.log(jhon.calcBmi())

*/

// METHOD-2 : Call the function within the context of an object

/*
 i.e; We just need to temporarily bind the 'this' context and our job will done.

*/
// USE CALL METHOD

/*
     To get jhons  BMI for instance, instead of executing the calcBMI fucntion directly,
     we'll append  an invocation to the built in call method to our function, and as 
     our first parameter we'll pass in object name(i.e; jhon or sarah) as the argument.

     The first parameter here allows you to bind the 'this' context to an object 

*/

console.log(`Jhon BMI: ${calcBmi.call(john)}`)
console.log(`Jhon BMR: ${calcBmr.call(john)}`)

console.log(`Sarah BMI: ${calcBmi.call(sarah)}`)
console.log(`Sarah BMR: ${calcBmr.call(sarah)}`)


/*
     The call method simply executes the function after rewirting the fucntion's 'this'
*/