def messy_function(x,y,z=None)   :
 if z==None:z=[]
 result= x+y
 for i in range(10):
     if i%2==0:
       result+=i
 return     result

class MessyClass :
  def __init__(self,value):
    self.value=value
  
  def get_value(self)   :
     return self.value