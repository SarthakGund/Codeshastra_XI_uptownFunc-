import random

letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
           'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
           'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
           'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
symbols = ['!', '#', '$', '%', '&', '(', ')', '*', '+']


def generate_password():
    length = int(input("Enter a password length (min 8): "))
    while length < 8:
        print("Password length must be at least 8.")
        length = int(input("Enter a password length (min 8): "))
   
    password_chars = [
        random.choice(letters),
        random.choice(numbers),
        random.choice(symbols)
    ]
    
  
    all_chars = letters + numbers + symbols
    
  
    for _ in range(length - 3):
        password_chars.append(random.choice(all_chars))
    
    
    random.shuffle(password_chars)
    
    return ''.join(password_chars)


print("Your password is: " + generate_password())
