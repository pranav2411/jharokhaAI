import sys
import json
import subprocess
import tempfile
import os
import ai_service

def run_in_sandbox(code: str, customizations: dict, base_price: float) -> dict:
    """Executes the pricing formula in a subprocess sandbox with a timeout.
    Returns:
        dict: {'success': bool, 'result': float, 'error': str}
    """
    # Create the wrapper runner script
    runner_script = f"""
import json
import sys

# User-defined pricing formula
{code}

if __name__ == '__main__':
    try:
        # Load args from command line arg
        payload = json.loads(sys.argv[1])
        customizations = payload.get("customizations", {{}})
        base_price = float(payload.get("base_price", 0.0))
        
        # Invoke formula
        val = calculate_price(customizations, base_price)
        print(json.dumps({{"success": True, "result": float(val)}}))
    except Exception as e:
        import traceback
        print(json.dumps({{"success": False, "error": str(e), "traceback": traceback.format_exc()}}))
"""

    with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
        f.write(runner_script)
        temp_filename = f.name

    try:
        payload_str = json.dumps({"customizations": customizations, "base_price": base_price})
        
        # Run subprocess under a 3 second timeout for safety
        proc = subprocess.run(
            [sys.executable, temp_filename, payload_str],
            capture_output=True,
            text=True,
            timeout=3
        )
        
        if proc.returncode != 0:
            # SyntaxError or runtime crash that wasn't caught inside
            return {
                "success": False,
                "result": 0.0,
                "error": proc.stderr.strip() or proc.stdout.strip() or f"Process exited with code {proc.returncode}"
            }
            
        # Parse stdout JSON
        try:
            out_data = json.loads(proc.stdout.strip())
            return {
                "success": out_data.get("success", False),
                "result": out_data.get("result", 0.0),
                "error": out_data.get("error", "")
            }
        except json.JSONDecodeError:
            return {
                "success": False,
                "result": 0.0,
                "error": f"Failed to parse runner output: {proc.stdout}"
            }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "result": 0.0,
            "error": "Execution timed out (infinite loop or hang detected)."
        }
    except Exception as e:
        return {
            "success": False,
            "result": 0.0,
            "error": f"Sandbox execution environment error: {str(e)}"
        }
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

def validate_and_heal_formula(instructions: str, test_customizations: dict, base_price: float) -> dict:
    """Generates the code, runs tests in the sandbox, and heals it if it throws compile/runtime errors.
    Retries up to 3 times.
    """
    current_instructions = instructions
    attempts = []
    
    # Attempt 1: Generate initial formula
    code = ai_service.generate_pricing_formula(current_instructions)
    attempts.append({"code": code, "error": None})

    for i in range(3):
        print(f"Sandbox verifying pricing code (Attempt {i+1})...")
        res = run_in_sandbox(code, test_customizations, base_price)
        
        if res["success"]:
            print("Sandbox verification succeeded!")
            return {
                "success": True,
                "code": code,
                "test_output_price": res["result"],
                "attempts_count": i + 1,
                "attempts": attempts
            }
        
        # Sandbox execution failed. Trigger Self-Healing loop by calling Gemini with the error stack
        error_msg = res["error"]
        attempts[-1]["error"] = error_msg
        
        print(f"Execution failed in Sandbox! Error: {error_msg}. Starting self-healing...")
        
        healing_prompt = (
            f"You wrote this python pricing code based on instructions '{instructions}':\n\n"
            f"```python\n{code}\n```\n\n"
            f"Running this code in our sandbox failed with the following error:\n"
            f"\"{error_msg}\"\n\n"
            "Please fix the bugs, syntax issues, or type mismatches, and return ONLY the corrected, clean python function. "
            "Do NOT include markdown ticks or explanations. Ensure it is named exactly `calculate_price(customizations, base_price)`."
        )
        
        if not ai_service.GEMINI_API_KEY:
            # Simulated healing check
            # Make code syntactically correct in simulator
            code = (
                "def calculate_price(customizations: dict, base_price: float) -> float:\n"
                "    extra_cost = 0.0\n"
                "    # Recovered from mock sandbox error\n"
                "    size_opt = customizations.get('Size', '10 inch')\n"
                "    if isinstance(size_opt, dict):\n"
                "        size_opt = size_opt.get('value', '10 inch')\n"
                "    size_num = int(''.join(filter(str.isdigit, str(size_opt))))\n"
                "    if size_num > 10:\n"
                "        extra_cost += (size_num - 10) * 150.0\n"
                "    return base_price + extra_cost"
            )
        else:
            try:
                contents = [{"parts": [{"text": healing_prompt}]}]
                healed_code = ai_service.call_gemini(contents)
                code = healed_code.replace("```python", "").replace("```", "").strip()
            except Exception as ex:
                print(f"Self-healing prompt request failed: {str(ex)}")
                break
                
        attempts.append({"code": code, "error": None})

    # If it still fails after 3 tries, return failure with the attempts info
    res = run_in_sandbox(code, test_customizations, base_price)
    return {
        "success": res["success"],
        "code": code,
        "test_output_price": res["result"] if res["success"] else base_price,
        "error": res["error"],
        "attempts_count": len(attempts),
        "attempts": attempts
    }
