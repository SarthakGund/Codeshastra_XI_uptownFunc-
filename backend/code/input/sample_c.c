#include <stdio.h>
#include <stdlib.h>

// This is a poorly formatted C file
int messyFunction(int x,int y,int z)   {
if(z==0) {z=1;}
int result= x+y;
for(int i=0;i<10;i++){
if(i%2==0){
result+=i;
}
}
return     result;
}

typedef struct {
int value;
char* name;
} MessyStruct;

int main() {
    int a=5,b=10;
    int result=messyFunction(a,b,0);
    printf("Result: %d\n",result);
    
    MessyStruct* obj = (MessyStruct*)malloc(sizeof(MessyStruct));
    obj->value=42;
    obj->name="test";
    
    printf("Value: %d, Name: %s\n",obj->value,obj->name);
    free(obj);
    return 0;
}