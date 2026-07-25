import sandbox
import ai_service

def test_correct_sandbox():
    print("Test 1: Running a correct dynamic pricing formula script in sandbox...")
    code = (
        "def calculate_price(customizations: dict, base_price: float) -> float:\n"
        "    extra = 0.0\n"
        "    if customizations.get('Color') == 'Blue':\n"
        "        extra += 150.0\n"
        "    return base_price + extra\n"
    )
    res = sandbox.run_in_sandbox(code, {"Color": "Blue"}, 1000.0)
    print(f"Result: {res}")
    assert res["success"] is True
    assert res["result"] == 1150.0
    print("Test 1 Passed!")

def test_buggy_sandbox_self_healing():
    print("Test 2: Verifying AI self-healing dynamic pricing logic in sandbox...")
    # Enter instructions containing keywords to verify self healing
    res = sandbox.validate_and_heal_formula(
        instructions="charge 150 extra for Cobalt Blue color, size above 10 inches adds 200",
        test_customizations={"Glaze Accent": "Cobalt Blue", "Size": "12 inch"},
        base_price=1000.0
    )
    print(f"Healing Result: {res}")
    assert res["success"] is True
    # The output should compile and return a float
    assert isinstance(res["test_output_price"], float)
    print("Test 2 Passed!")

if __name__ == '__main__':
    test_correct_sandbox()
    test_buggy_sandbox_self_healing()
    print("All backend tests passed successfully!")
