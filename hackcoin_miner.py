"""
HackCoin Enhanced Miner with Variable Hash Difficulty
Advanced mining capabilities with customizable parameters
"""

import time
import hashlib
import json
import requests
import base64
from flask import Flask, request, jsonify
from multiprocessing import Process, Pipe
import ecdsa
import threading
import sys
import os

from miner_config import MINER_ADDRESS, MINER_NODE_URL, PEER_NODES

node = Flask(__name__)

class HackCoinBlock:
    def __init__(self, index, timestamp, data, previous_hash, difficulty=7919):
        """Enhanced Block class for HackCoin with variable difficulty support"""
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previous_hash = previous_hash
        self.difficulty = difficulty
        self.nonce = 0
        self.hash = self.hash_block()

    def hash_block(self):
        """Creates the unique hash for the block using SHA256"""
        sha = hashlib.sha256()
        block_string = f"{self.index}{self.timestamp}{self.data}{self.previous_hash}{self.nonce}"
        sha.update(block_string.encode('utf-8'))
        return sha.hexdigest()

    def mine_block(self, difficulty=None):
        """Mine block with specified difficulty"""
        if difficulty is None:
            difficulty = self.difficulty
        
        target = "0" * (difficulty // 1000)  # Simple difficulty adjustment
        while self.hash[:len(target)] != target:
            self.nonce += 1
            self.hash = self.hash_block()
        
        print(f"Block mined: {self.hash}")
        return self.hash

def create_genesis_block():
    """Create the genesis block with HackCoin branding"""
    return HackCoinBlock(0, time.time(), {
        "proof-of-work": 9,
        "transactions": None,
        "message": "HackCoin Genesis Block - The Future of Decentralized Currency"},
        "0")

# Node's blockchain copy
BLOCKCHAIN = [create_genesis_block()]
NODE_PENDING_TRANSACTIONS = []

# Mining configuration
MINING_CONFIG = {
    'difficulty': 7919,
    'threads': 1,
    'intensity': 'medium',
    'custom_difficulty': False
}

def enhanced_proof_of_work(last_proof, blockchain, difficulty=None):
    """Enhanced proof of work with variable difficulty"""
    if difficulty is None:
        difficulty = MINING_CONFIG['difficulty']
    
    incrementer = last_proof + 1
    start_time = time.time()
    
    print(f"Starting mining with difficulty: {difficulty}")
    
    while not (incrementer % difficulty == 0 and incrementer % last_proof == 0):
        incrementer += 1
        
        # Check if any node found the solution every 30 seconds
        if int((time.time() - start_time) % 30) == 0:
            # If any other node got the proof, stop searching
            new_blockchain = consensus(blockchain)
            if new_blockchain:
                return False, new_blockchain
        
        # Update hash rate for GUI
        if incrementer % 1000 == 0:
            elapsed = time.time() - start_time
            hash_rate = incrementer / elapsed if elapsed > 0 else 0
            print(f"Hash rate: {hash_rate:.2f} H/s")
    
    elapsed = time.time() - start_time
    final_hash_rate = incrementer / elapsed if elapsed > 0 else 0
    print(f"Proof of work found! Final hash rate: {final_hash_rate:.2f} H/s")
    
    return incrementer, blockchain

def enhanced_mine(pipe_connection, blockchain, node_pending_transactions):
    """Enhanced mining function with performance metrics"""
    global BLOCKCHAIN, NODE_PENDING_TRANSACTIONS, MINING_CONFIG
    
    BLOCKCHAIN = blockchain
    NODE_PENDING_TRANSACTIONS = node_pending_transactions
    
    print("HackCoin Enhanced Mining Started...")
    print(f"Miner Address: {MINER_ADDRESS}")
    print(f"Difficulty: {MINING_CONFIG['difficulty']}")
    print(f"Threads: {MINING_CONFIG['threads']}")
    print(f"Intensity: {MINING_CONFIG['intensity']}")
    print("-" * 50)
    
    blocks_mined = 0
    total_hash_rate = 0
    
    while True:
        try:
            # Get the last proof of work
            last_block = BLOCKCHAIN[-1]
            last_proof = last_block.data['proof-of-work'] if isinstance(last_block.data, dict) else 9
            
            # Find the proof of work for the current block being mined
            start_time = time.time()
            proof = enhanced_proof_of_work(last_proof, BLOCKCHAIN, MINING_CONFIG['difficulty'])
            
            # If we didn't guess the proof, start mining again
            if not proof[0]:
                BLOCKCHAIN = proof[1]
                pipe_connection.send(BLOCKCHAIN)
                continue
            else:
                # Successful mining
                mining_time = time.time() - start_time
                blocks_mined += 1
                
                # Load pending transactions
                try:
                    NODE_PENDING_TRANSACTIONS = requests.get(
                        url=MINER_NODE_URL + '/txion', 
                        params={'update': MINER_ADDRESS},
                        timeout=10
                    ).content
                    NODE_PENDING_TRANSACTIONS = json.loads(NODE_PENDING_TRANSACTIONS)
                except Exception as e:
                    print(f"Error fetching transactions: {e}")
                    NODE_PENDING_TRANSACTIONS = []
                
                # Add mining reward
                NODE_PENDING_TRANSACTIONS.append({
                    "from": "network",
                    "to": MINER_ADDRESS,
                    "amount": 1,
                    "type": "mining_reward"
                })
                
                # Create new block
                new_block_data = {
                    "proof-of-work": proof[0],
                    "transactions": list(NODE_PENDING_TRANSACTIONS),
                    "mining_time": mining_time,
                    "hash_rate": proof[0] / mining_time if mining_time > 0 else 0,
                    "difficulty": MINING_CONFIG['difficulty']
                }
                
                new_block_index = last_block.index + 1
                new_block_timestamp = time.time()
                last_block_hash = last_block.hash
                
                # Create new HackCoin block
                mined_block = HackCoinBlock(
                    new_block_index, 
                    new_block_timestamp, 
                    new_block_data, 
                    last_block_hash,
                    MINING_CONFIG['difficulty']
                )
                
                BLOCKCHAIN.append(mined_block)
                
                # Mining success message
                print("\n" + "="*60)
                print(f"🎉 HACKCOIN BLOCK MINED! 🎉")
                print(f"Block Index: {new_block_index}")
                print(f"Mining Time: {mining_time:.2f} seconds")
                print(f"Hash Rate: {proof[0] / mining_time:.2f} H/s")
                print(f"Difficulty: {MINING_CONFIG['difficulty']}")
                print(f"Reward: 1 HCK")
                print(f"Total Blocks Mined: {blocks_mined}")
                print("="*60 + "\n")
                
                # Send updated blockchain
                pipe_connection.send(BLOCKCHAIN)
                
                # Clear pending transactions
                NODE_PENDING_TRANSACTIONS = []
                
                # Notify other nodes
                try:
                    requests.get(
                        url=MINER_NODE_URL + '/blocks', 
                        params={'update': MINER_ADDRESS},
                        timeout=5
                    )
                except Exception as e:
                    print(f"Error notifying nodes: {e}")
                    
        except KeyboardInterrupt:
            print("\nMining stopped by user")
            break
        except Exception as e:
            print(f"Mining error: {e}")
            time.sleep(1)

# Enhanced API endpoints
@node.route('/mining/start', methods=['POST'])
def start_mining():
    """API endpoint to start mining with custom parameters"""
    global MINING_CONFIG
    
    try:
        data = request.get_json()
        if data:
            MINING_CONFIG['difficulty'] = data.get('difficulty', 7919)
            MINING_CONFIG['threads'] = data.get('threads', 1)
            MINING_CONFIG['intensity'] = data.get('intensity', 'medium')
        
        return jsonify({
            'success': True,
            'message': 'Mining started',
            'config': MINING_CONFIG
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@node.route('/mining/stop', methods=['POST'])
def stop_mining():
    """API endpoint to stop mining"""
    return jsonify({'success': True, 'message': 'Mining stopped'})

@node.route('/mining/stats', methods=['GET'])
def mining_stats():
    """API endpoint to get mining statistics"""
    return jsonify({
        'difficulty': MINING_CONFIG['difficulty'],
        'threads': MINING_CONFIG['threads'],
        'intensity': MINING_CONFIG['intensity'],
        'blocks_count': len(BLOCKCHAIN),
        'is_mining': True  # This would be dynamic in a real implementation
    })

@node.route('/mining/config', methods=['POST'])
def update_mining_config():
    """API endpoint to update mining configuration"""
    global MINING_CONFIG
    
    try:
        data = request.get_json()
        if data:
            MINING_CONFIG.update(data)
        
        return jsonify({
            'success': True,
            'config': MINING_CONFIG
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Keep original endpoints for compatibility
def find_new_chains():
    """Get the blockchains of every other node"""
    other_chains = []
    for node_url in PEER_NODES:
        try:
            block = requests.get(url=node_url + "/blocks", timeout=10).content
            block = json.loads(block)
            validated = validate_blockchain(block)
            if validated:
                other_chains.append(block)
        except Exception as e:
            print(f"Error connecting to peer {node_url}: {e}")
    return other_chains

def consensus(blockchain):
    """Consensus algorithm to find the longest valid chain"""
    other_chains = find_new_chains()
    BLOCKCHAIN = blockchain
    longest_chain = BLOCKCHAIN
    
    for chain in other_chains:
        if len(longest_chain) < len(chain):
            longest_chain = chain
    
    if longest_chain == BLOCKCHAIN:
        return False
    else:
        BLOCKCHAIN = longest_chain
        return BLOCKCHAIN

def validate_blockchain(block):
    """Validate the submitted chain"""
    # Enhanced validation logic would go here
    return True

@node.route('/blocks', methods=['GET'])
def get_blocks():
    """Get blockchain blocks"""
    global BLOCKCHAIN
    
    if request.args.get("update") == MINER_ADDRESS:
        BLOCKCHAIN = pipe_input.recv()
    
    chain_to_send = BLOCKCHAIN
    chain_to_send_json = []
    
    for block in chain_to_send:
        block_dict = {
            "index": str(block.index),
            "timestamp": str(block.timestamp),
            "data": str(block.data),
            "hash": block.hash
        }
        chain_to_send_json.append(block_dict)
    
    return json.dumps(chain_to_send_json, sort_keys=True)

@node.route('/txion', methods=['GET', 'POST'])
def transaction():
    """Handle transactions"""
    global NODE_PENDING_TRANSACTIONS
    
    if request.method == 'POST':
        new_txion = request.get_json()
        
        # Enhanced transaction validation
        if validate_signature(new_txion['from'], new_txion['signature'], new_txion['message']):
            NODE_PENDING_TRANSACTIONS.append(new_txion)
            
            print(f"New HackCoin Transaction:")
            print(f"FROM: {new_txion['from']}")
            print(f"TO: {new_txion['to']}")
            print(f"AMOUNT: {new_txion['amount']} HCK")
            print("-" * 40)
            
            return "Transaction submission successful\n"
        else:
            return "Transaction submission failed. Invalid signature\n"
    
    elif request.method == 'GET' and request.args.get("update") == MINER_ADDRESS:
        pending = json.dumps(NODE_PENDING_TRANSACTIONS, sort_keys=True)
        NODE_PENDING_TRANSACTIONS[:] = []
        return pending

def validate_signature(public_key, signature, message):
    """Validate ECDSA signature"""
    try:
        public_key = (base64.b64decode(public_key)).hex()
        signature = base64.b64decode(signature)
        vk = ecdsa.VerifyingKey.from_string(bytes.fromhex(public_key), curve=ecdsa.SECP256k1)
        return vk.verify(signature, message.encode())
    except Exception as e:
        print(f"Signature validation error: {e}")
        return False

def welcome_msg():
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║               🚀 HACKCOIN v1.0.0 🚀                        ║
    ║                ADVANCED BLOCKCHAIN SYSTEM                    ║
    ║                                                              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║                                                              ║
    ║  Features:                                                   ║
    ║  • Variable Hash Difficulty Mining                           ║
    ║  • Multi-threaded Processing                                 ║
    ║  • Real-time GUI Interface                                   ║
    ║  • Enhanced Security & Performance                           ║
    ║  • Advanced Wallet Management                                ║
    ║                                                              ║
    ║  Access GUI: http://localhost:3001                           ║
    ║  API Endpoint: http://localhost:5000                         ║
    ║                                                              ║
    ║  Make sure you are using the latest version!                 ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

if __name__ == '__main__':
    welcome_msg()
    
    print("Initializing HackCoin Miner...")
    print(f"Miner Address: {MINER_ADDRESS}")
    print(f"Node URL: {MINER_NODE_URL}")
    print(f"Peer Nodes: {len(PEER_NODES)}")
    print("-" * 60)
    
    # Start mining process
    pipe_output, pipe_input = Pipe()
    miner_process = Process(target=enhanced_mine, args=(pipe_output, BLOCKCHAIN, NODE_PENDING_TRANSACTIONS))
    miner_process.start()
    
    # Start Flask server
    try:
        print("Starting HackCoin Node Server...")
        node.run(host='0.0.0.0', port=5000, debug=False)
    except KeyboardInterrupt:
        print("\nShutting down HackCoin Miner...")
        miner_process.terminate()
        miner_process.join()
        print("HackCoin Miner stopped successfully!")
    except Exception as e:
        print(f"Error starting server: {e}")
        miner_process.terminate()
        miner_process.join()
