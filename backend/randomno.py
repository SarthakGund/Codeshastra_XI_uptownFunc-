import secrets
import uuid

def generate_random_number(start, end):
    if start > end:
        raise ValueError("Start must be less than or equal to end.")
    return secrets.randbelow(end - start + 1) + start

def generate_uuid1():
    """UUID1: Based on host ID and current time."""
    return str(uuid.uuid1())

def generate_uuid4():
    """UUID4: Random UUID (secure and most commonly used)."""
    return str(uuid.uuid4())

if __name__ == "__main__":
    start = int(input("Enter start of range: "))
    end = int(input("Enter end of range: "))
    print("Random number:", generate_random_number(start, end))
    print("UUID1:", generate_uuid1())
    print("UUID4:", generate_uuid4())