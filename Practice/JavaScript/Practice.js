// 'use strict'

// Variables
var num = 10;
console.log(num);
// ---------------------------------------------------------------------------------------------------

/* Exeption handiling */

var costOfProduct = 30;
var discount = 20;
try{
    if(costOfProduct <=discount){
        throw new Error(
            "Cost of the product should be higher than the discount"
        );
    }
    var totalCost = costOfProduct - discount;
    console.log(`Total Cost of the product is ${totalCost}`);

}catch(error){
    console.log("Opps some thing went wron! \n"+error.message);
}finally{
    console.log("Thank you for using this App")
}

// console.log(costOfProduct)
// try {
//     if (costOfProduct <= discount)
//       throw new Error(
//         'Cost of the product should be higher than the discount value'
//       );
//     var totalCost = costOfProduct - discount;
//     console.log('Total Cost: ${totalCost}');
//   } catch (error) {
//     console.log('Oops! We have an error: ', error.message);
//   } finally {
//     console.log('Thank you for using the app!');
//   } 

  // ---------------------------------------------------------------------------------------------------

/* Variables */

function doSomething(){
     
        console.log(user1);
        var user1 ="Jhon";
    
    
}


function letSomething(){
     
    console.log(user1);
    let user1 ="Jhon";


}
try{
    letSomething()
}catch(error){
    console.log(error.message)
}

try{
    doSomething();
}catch(error){
    console.log(error.message)
}
// getting undefined. Because variables with var are hoisted, they’re first declared and set to undefined and values assigned later.
// ---------------------------------------------------------------------------------------------------
/* Condition Statements */

// if else statment

let n1 = 100;
let n2 = 20;
if(n1<n2){
    console.log("n2 is greater than n1");
}else{
    console.log("n1 is greater than n2")
}

//if else if

let currentHour =11

if(currentHour>=0 && currentHour<12){
    console.log("Good Morning!")
}else if(currentHour>=11 && currentHour<16){
    console.log("Good Afternoon!")
}else if(currentHour>=16 && currentHour<20){
    console.log("Good Eveining!")
}else{
    console.log("Good Night!")
}


/* switch case*/
/*
switch(expression){
    case 1: 
        statement for case 1
        break;
    case 2: 
        statement for case 2
        break;
    case 3: 
        statement for case 3
        break;
    default:
        statement for default
        break;
    
}*/

/* Ternory Operators */


/*
    if(n1<n2){
    console.log("n2 is greater than n1");
    }else{
        console.log("n1 is greater than n2")
    }

    Write this code using ternary operators
*/

// Expression/condition ? OperandIfTrue : OperandIfFalse
n1=1
n1>n2 ? console.log("n1 is greater than n2") : console.log("n2 is greater than n1")

/*
    let currentHour =11

if(currentHour>=0 && currentHour<12){
    console.log("Good Morning!")
}else if(currentHour>=11 && currentHour<16){
    console.log("Good Afternoon!")
}else if(currentHour>=16 && currentHour<20){
    console.log("Good Eveining!")
}else{
    console.log("Good Night!")
}
solve above code using ternary operator
*/

currentHour= 24
currentHour>=0 && currentHour<12 ? console.log("Good Morning!"): currentHour >=12 && currentHour <16 ? console.log("Good Afternoon!"):currentHour>=16 && currentHour<20?console.log("Good Evening!"): console.log("Good Night")

/* Nullish Coalescing Operator*/

/* One of the core uses of this operator is providing a mechanism to get default values in cases like 
these where we’re dependent on the value of the user variable and we want to provide a default
value if the user is not defined. 
*/

let user = '';  
console.log(`Hello ${user || 'Stranger'}`); // or operator -->If the operand on the left is true, then its value is returned. If not, then the operand on the right is returned.

/*
    The trouble with this approach arises when the value of the operand on the left is 
    something like 0 or an empty string.You may not want these to be evaluated as false.
    In such cases, the OR operator isn’t a wise choice. 
*/

let quantity = '0';
console.log(`Quantity : ${Number(quantity)|| "N/A"} -- with or operator `)
console.log(`Quantity : ${Number(quantity)?? "N/A"} --> we use Nullish Operator to give default value for each variable`)

/* Optional Chaining Operator */

/*
    Here’s an object with some properties including nested properties. Accessing these properties involves using the dot syntax for instance.  
*/
    let user2= {
        name: 'Jhon',
        age: 21,
        phone:{
            personal: '662-122-123',
            official: '442-191-012'
        }
    }

    // console.log(user2)
    try{
        console.log(`Personal Numbner : ${user2.phone.personal}`)
    }catch(error){
        console.log(error.message)
    }
/*
    But one of the problems with this approach is that if an intermediate property is non-existent,
    then we straight away get an error and this can break things down.
*/

// nested objec try to access from undened key
try{
    console.log(`City Name: ${user2.address.city}`);
}catch(error){
    console.log(error.message)
}

/*
It would be better if we could return an undefined if intermediate properties did not exist and as a result, we were unable to reach the property being accessed on the far right of this expression. 

This is because the optional chaining operator short-circuits the expression which means that the part on the right-hand side is not executed at all, thus preventing the error.   

And the optional chaining operator can also be used when accessing elements from arrays.
*/

// QUESTION
/* 
    2Q) Bellow we an array featuring two objects which represent restaurants and we will display the location coordinates of the restaurants. 
*/

let restaurants = [
    {
        name: 'Restaurant 1',
        category: 'Orental',
        city: 'New York',
        location:{
            lat: 36.88,
            long:78.21
        }
    },{
        name: 'Imperial Dinner',
        category:'Contenental',
        city:'Los Angeles'
    }
];

// 2.1Ans     To do this access the location.lat and location.long properties of the first object from the array.

try{
    console.log(`Location: ${restaurants[0].location.lat}, ${restaurants[0].location.long}`);
}catch(error){
    console.log(error.message)
}

// Try to print the location for the second object

try{
    console.log(`Location: ${restaurants[1].location.lat}, ${restaurants[1].location.long}`)
}catch(error){
    console.log(error.message);
}//Got error message as --> Cannot read properties of undefined (reading 'lat')

/*
To solve this error, we can use the optional chaining operator. 
The single question mark here will first check for the presence of the location property 
before it evaluates the rest of the expression. 
If the location property is found, then it proceeds to the rest of the expression, otherwise, it returns undefined here itself.   

*/
//add question mark after keyword 

try{
    console.log(`Location: ${restaurants[1].location?.lat}, ${restaurants[1].location?.long}`);
}catch(error){
    console.log(error.message)
}//Location: undefined, undefined

/*
    Running above code now displays undefined, undefined. 
    This is a great opportunity to use the nullish coalescing operator to display the words NA which stand for Not Available. 
*/

try{
    console.log(`Location: ${restaurants[1].location?.lat ?? 'N/A'}, ${restaurants[1].location?.long ?? 'N/A'}`)
}catch(error){
    console.log(error.message)
}//Location: N/A, N/A

// ---------------------------------------------------------------------------------------------------------------------------
/* Functions */


/*
// Funtion declaration Syntax
   
    function nameOfFuction(parmeter1, paremetr2){
        return statement
    }

// Function calling or Function execution

    nameOfFunction(Argument1, Argument2);

    here parameter ==> variables of functions
         Arguments ==> value for those function variables or parameters


*/


// QUESTION : Calculate the area and Perimeter of the rectangle with the function?
function computeRectStats(length,width){
    try{
        let areaRectangle = Number(length)*Number(width);
        let perimeterRectangle = 2*(Number(length)+Number(width));
        console.log(`Area: ${areaRectangle}`);
        console.log(`Perimeter: ${perimeterRectangle}`);


    }catch(error){
        console.log(error.message)
    }
}

// computeRectStats(19,30)

let rectALength = 25;
let rectAWidth= 10;

computeRectStats(rectALength,rectAWidth);
let rectBLength = 55;
let rectBWidth= 109;
computeRectStats(rectBLength,rectBWidth);

// QUESTION : Compute payable when the discount, cost of the product is given using function where the discount is given when the cost is more tha 1000

function computePayable(cost){
    let discount = Number(cost)<1000 ? 0 : 10;
        console.log(`Cost Of Product: ${cost}`)
        console.log(`Discount: ${discount}`); 
        let totalPayable = Number(cost)- (Number(cost)*discount/100)
        return `Total Cost: ${totalPayable}` 
    // return Number(cost)- (Number(cost)*discount/100) 
}


console.log(computePayable(1800));
console.log(computePayable(500));

// QUESTION : Find the distance between point

let p1 ={
    x:1,
    y:2
}

let p2={
    x:1,
    y:5
}

function calcDistance(point1,point2){
    let distance = [(point2.x-point1.x)**2 +(point2.y-point1.y)**2]**0.5
    console.log(distance)
}

// Math.hypot(p2.x-p1.x, p2.y-p1.y) --> returns the distance
calcDistance(p1,p2)
console.log(`Used Math.hypot function --> ${Math.hypot(p2.x-p1.x, p2.y-p1.y)}`);


const today = new Date();
console.log(today.getDay());


// Function Expression Syntax

/*
    A function expression is very similar to, and has almost the same syntax as, a function declaration. 
    The main difference between a function expression and a function declaration is the function name,
    which can be omitted in function expressions to create anonymous functions.

    We can call the function declaration 1st and then declare the function 
    because the function declaration is hoisted at the to before executing any thing. 
    But for function Expression it is not possible to execulte the function before writing a expression.
*/

/*
    Convert bellow fucntion declaration into an Function expression
*/

/* 
QUESION: convert the function find the area of the circle to fucntion expression
ANS:  function areaOfCircle(radius)
    fucntion areaOfCircle(radius){
        return 2* Math.PI* radius**2
    }
*/
//We can call circleArea function before declaring it but if we try to call areaOfCircle fucntion before declaring we will get error

try{
    circleArea(40)
}catch(error){
    console.log(error.message)
}

try{
    areaOfCircle(40)
}catch(error){
    console.log(error.message) // we get error: Cannot access 'areaOfCircle' before initialization
}
//The function expression avoid making or creating function in global which will reduce the risk of effect of the function on other functionalities
//We can create fucntion expression with out giving it a name by saving it in variable due to which we can use same name of the fucntion vasriabel with in the function.
function circleArea(radius){
    return 2*Math.PI*radius**2

}

const areaOfCircle = function(radius){
    return 2*Math.PI*radius**2
}

console.log(areaOfCircle(10))

// QUESTION : Create a Function Expression getDay(), a function that get name of the current day ? today's day

const getDay = function(){
    const days =[
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thusday",
        "Friday",
        "Saturday"
    ];

    const today = new Date().getDay();
    return days[today];
}

console.log(`Todays day is ${getDay()}`)

/*Function declaration are hoisted which they are initialised and made available to use before any other code runs. So they are universally avaible . 
 
However ,the same cannot to said about function expressions which are only only available after they're declared in code

function expression do no polute global scope unlike function declaration  which can end up in the global scope in some cases
 */

// QUESTION: Create a fucntion expression that converts a given temperature to degree Celsius or Farenheit

const convertTemp = function(temp, convertTo){
        let toUnit = convertTo ?? 'F';
        let tempToConver = temp ?? 0;
        
        switch(toUnit){
            case 'F': 
                let farenheit = (tempToConver*9)/5+32
                return `${farenheit}\u{00B0}F`
            default:
                let celsius = (tempToConver - 32)*5/2
                return `${celsius}\u{00B0}C`
        }
}

console.log(convertTemp(30))
console.log(convertTemp(90,"C"))
console.log(convertTemp(45,"F"))
console.log(convertTemp(undefined,"C"))
console.log(convertTemp())
console.log("===========================")
let text = "12:01:00PM"
let position = text.search("A");


console.log(position)

// -----------------------------------------------------------------------------------------------------------------------
// The 'this' Keyword and Function Execution Context


