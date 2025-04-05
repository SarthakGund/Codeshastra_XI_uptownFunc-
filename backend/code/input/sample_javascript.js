function messyFunction(x,y,z)   {
if(!z) {z=[]}
let result= x+y;
for(let i=0;i<10;i++){
if(i%2===0){
result+=i;
}
}
return     result;
}

class MessyClass {
constructor(value){
this.value=value;
}
  
getValue()   {
return this.value;
}
}