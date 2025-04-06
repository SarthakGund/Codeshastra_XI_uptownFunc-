from flask import Blueprint, request, jsonify
from unitconvertor import convert_length, convert_weight, convert_temperature
from unitconvertor import convert_currency, convert_volume, convert_area

uc_bp = Blueprint("unit_convertor_bp", __name__, url_prefix="/api/convert")

@uc_bp.route("/length", methods=["POST"])
def api_convert_length():
    try:
        value = float(request.args.get("value"))
        from_unit = request.args.get("from")
        to_unit = request.args.get("to")
        result = convert_length(value, from_unit, to_unit)
        if result is None:
            return jsonify({"error": "Unsupported conversion or invalid units"}), 400
        return jsonify({
            "source": {"value": value, "unit": from_unit},
            "target": {"value": result, "unit": to_unit}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@uc_bp.route("/weight", methods=["POST"])
def api_convert_weight():
    try:
        value = float(request.args.get("value"))
        from_unit = request.args.get("from")
        to_unit = request.args.get("to")
        result = convert_weight(value, from_unit, to_unit)
        if result is None:
            return jsonify({"error": "Unsupported conversion or invalid units"}), 400
        return jsonify({
            "source": {"value": value, "unit": from_unit},
            "target": {"value": result, "unit": to_unit}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@uc_bp.route("/temperature", methods=["POST"])
def api_convert_temperature():
    try:
        value = float(request.args.get("value"))
        from_unit = request.args.get("from")
        to_unit = request.args.get("to")
        result = convert_temperature(value, from_unit, to_unit)
        if result is None:
            return jsonify({"error": "Unsupported conversion or invalid units"}), 400
        return jsonify({
            "source": {"value": value, "unit": from_unit},
            "target": {"value": result, "unit": to_unit}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@uc_bp.route("/currency", methods=["POST"])
def api_convert_currency():
    try:
        value = float(request.args.get("value"))
        cur_from = request.args.get("from")
        cur_to = request.args.get("to")
        result = convert_currency(value, cur_from, cur_to)
        if result is None:
            return jsonify({"error": "Unsupported conversion or invalid currencies"}), 400
        return jsonify({
            "source": {"value": value, "currency": cur_from.upper()},
            "target": {"value": result, "currency": cur_to.upper()}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@uc_bp.route("/volume", methods=["POST"])
def api_convert_volume():
    try:
        value = float(request.args.get("value"))
        from_unit = request.args.get("from")
        to_unit = request.args.get("to")
        result = convert_volume(value, from_unit, to_unit)
        if result is None:
            return jsonify({"error": "Unsupported conversion or invalid units"}), 400
        return jsonify({
            "source": {"value": value, "unit": from_unit},
            "target": {"value": result, "unit": to_unit}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@uc_bp.route("/area", methods=["POST"])
def api_convert_area():
    try:
        value = float(request.args.get("value"))
        from_unit = request.args.get("from")
        to_unit = request.args.get("to")
        result = convert_area(value, from_unit, to_unit)
        if result is None:
            return jsonify({"error": "Unsupported conversion or invalid units"}), 400
        return jsonify({
            "source": {"value": value, "unit": from_unit},
            "target": {"value": result, "unit": to_unit}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500