from flask import Blueprint, request, jsonify
from flask_cors import CORS
import socket
import requests
import subprocess
import platform
import re
from pythonping import ping as py_ping
import dns.resolver
import time

nt_bp = Blueprint('network_tools', __name__, url_prefix='/api')
# CORS(nt_bp)

@nt_bp.route('/ip-lookup', methods=['POST'])
def ip_lookup():
    data = request.json
    ip = data.get('ip')
    
    if not ip:
        return jsonify({"error": "IP address is required"}), 400
        
    try:
        # Using ipinfo.io API for IP lookup
        response = requests.get(f"https://ipinfo.io/{ip}/json")
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": f"Error performing IP lookup: {str(e)}"}), 500

@nt_bp.route('/dns-lookup', methods=['POST'])
def dns_lookup():
    data = request.json
    domain = data.get('domain')
    
    if not domain:
        return jsonify({"error": "Domain name is required"}), 400
        
    try:
        answers = dns.resolver.resolve(domain, 'A')
        ips = [rdata.to_text() for rdata in answers]
        result = {
            "domain": domain,
            "ip": ips[0] if ips else None,
            "all_ips": ips
        }
        return jsonify(result), 200
    except dns.resolver.NXDOMAIN:
        return jsonify({"error": f"DNS lookup failed. Cannot resolve {domain}"}), 404
    except Exception as e:
        return jsonify({"error": f"Error performing DNS lookup: {str(e)}"}), 500

@nt_bp.route('/ping', methods=['POST'])
def ping():
    data = request.json
    target = data.get('target')
    count = data.get('count', 4)
    
    if not target:
        return jsonify({"error": "Target host or IP is required"}), 400
        
    if count > 20:
        count = 20
        
    try:
        response = py_ping(target, count=count)
        
        statistics = {
            "min_ms": response.rtt_min_ms,
            "max_ms": response.rtt_max_ms,
            "avg_ms": response.rtt_avg_ms,
            "packet_loss_percent": response.packet_loss * 100
        }
        
        return jsonify({
            "output": str(response),
            "statistics": statistics,
        }), 200
    except Exception as e:
        return jsonify({"error": f"Error executing ping: {str(e)}"}), 500

@nt_bp.route('/traceroute', methods=['POST'])
def traceroute():
    data = request.json
    target = data.get('target')
    max_hops = data.get('max_hops', 30)  # Default 30 hops
    port = 80  # Common port for TCP traceroute

    if not target:
        return jsonify({"error": "Target host or IP is required"}), 400

    if max_hops > 30:
        max_hops = 30

    hops = []

    for ttl in range(1, max_hops + 1):
        try:
            # Create a TCP socket
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(2.0)
            s.setsockopt(socket.IPPROTO_IP, socket.IP_TTL, ttl)

            start_time = time.time()
            result = s.connect_ex((target, port))
            rtt = round((time.time() - start_time) * 1000, 2)  # Round-trip time in ms

            try:
                # On a successful connection or connection refusal, getpeername may work
                hop_ip = s.getpeername()[0]
            except Exception:
                hop_ip = target

            hops.append({"ttl": ttl, "ip": hop_ip, "rtt": rtt})
            s.close()

            # If connection succeeded or was refused (common on TCP traceroute), end traceroute.
            # Note: result == 0 indicates success while a connection refusal often indicates you've reached the target.
            if result == 0 or result == socket.errno.ECONNREFUSED:
                break
        except Exception as e:
            hops.append({"ttl": ttl, "ip": "*", "rtt": None, "error": str(e)})

    return jsonify({
        "target": target,
        "hops": hops
    }), 200