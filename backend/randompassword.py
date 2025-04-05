import secrets
import string
import math


def generate_secure_password(length=12, use_symbols=True, use_numbers=True):
    if length < 8:
        raise ValueError("Password length must be at least 8 characters.")

    characters = string.ascii_letters
    if use_numbers:
        characters += string.digits
    if use_symbols:
        characters += string.punctuation

    password = []
    if use_numbers:
        password.append(secrets.choice(string.digits))
    if use_symbols:
        password.append(secrets.choice(string.punctuation))
    password.append(secrets.choice(string.ascii_lowercase))
    password.append(secrets.choice(string.ascii_uppercase))

    while len(password) < length:
        password.append(secrets.choice(characters))

    secrets.SystemRandom().shuffle(password)
    return ''.join(password)


def password_entropy(password):
    charset = 0
    if any(c.islower() for c in password):
        charset += 26
    if any(c.isupper() for c in password):
        charset += 26
    if any(c.isdigit() for c in password):
        charset += 10
    if any(c in string.punctuation for c in password):
        charset += len(string.punctuation)

    entropy = len(password) * math.log2(charset)
    return round(entropy, 2)


# length = int(input("Enter desired password length (min 8): "))
# use_symbols = input("Include symbols? (y/n): ").lower() == 'y'
# use_numbers = input("Include numbers? (y/n): ").lower() == 'y'

# password = generate_secure_password(length, use_symbols, use_numbers)
# entropy = password_entropy(password)

# print("\nYour secure password is:", password)
# print("Estimated strength (entropy):", entropy, "bits")

# if entropy < 40:
#     print("Strength: Weak")
# elif entropy < 60:
#     print("Strength: Moderate")
# else:
#     print("Strength: Strong")
