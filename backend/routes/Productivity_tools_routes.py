from flask import Blueprint, request, jsonify

p_bp = Blueprint("p_bp", __name__, url_prefix="/api/tools")

@p_bp.route("/schedule", methods=["POST"])
def schedule_task():
    data = request.get_json() or {}
    task = data.get("task")
    run_at = data.get("run_at")
    if not task or not run_at:
        return jsonify({"error": "Missing 'task' or 'run_at' parameter"}), 400
    return jsonify({"message": f"Task '{task}' scheduled to run at {run_at}"}), 200

@p_bp.route("/timer", methods=["POST"])
def start_timer():
    data = request.get_json() or {}
    duration = data.get("duration")
    if not duration:
        return jsonify({"error": "Missing 'duration' parameter"}), 400
    try:
        duration = float(duration)
    except ValueError:
        return jsonify({"error": "Duration must be a number"}), 400
    # For demonstration, we immediately return instead of waiting.
    return jsonify({"message": f"Timer started for {duration} seconds"}), 200

counter = 0
@p_bp.route("/counter", methods=["GET", "POST"])
def counter_endpoint():
    global counter
    if request.method == "POST":
        data = request.get_json() or {}
        inc = data.get("increment", 1)
        try:
            inc = int(inc)
        except ValueError:
            return jsonify({"error": "Increment must be an integer"}), 400
        counter += inc
    return jsonify({"counter": counter}), 200