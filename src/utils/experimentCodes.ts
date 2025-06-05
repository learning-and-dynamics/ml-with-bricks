const boilerplate = () => `
import runloop, hub, json

class Eventer:
    def __init__(self):
        self.__subscribers = {}
        self.__queue = []

    def subscribe(self, event_name, callback):
        if event_name not in self.__subscribers:
            self.__subscribers[event_name] = []
        self.__subscribers[event_name].append(callback)

    def emit(self, event_name):
        # Instead of recursive calls, just queue the event
        self.__queue.append(event_name)

    async def process(self):
        while self.__queue:
            event_name = self.__queue.pop(0)
            runloop.run(*[callback() for callback in self.__subscribers[event_name]])

    def is_queue_non_empty(self):
        return bool(self.__queue)

eventer = Eventer()

class Messenger():
    def __init__(self, tunnel):
        self.__tunnel = tunnel
        self.__queue = []
        self.__is_sending = False
        self.__buffer = []

        self.__BANDWIDTH = 8192 // 16
        self.__MAX_PACKET_SIZE = 509 # assume it's always default
        # [max message size] = [max packet size] - [number of bytes for storing message code, length, frameId, totalFrames]
        self.__MAX_MESSAGE_SIZE = self.__MAX_PACKET_SIZE - 5 # 1 for ID, 2 for length, 1 for frameId, 1 for frameTotal


    def __queue_message(self, message):
        # encoding the message
        encoded_full_message = message.encode('utf-8')

        chunks = [
            encoded_full_message[i:i + self.__MAX_MESSAGE_SIZE]
            for i in range(0, len(encoded_full_message), self.__MAX_MESSAGE_SIZE)
        ]

        total_frames = len(chunks)

        frames = [
            bytes([frame_id, total_frames]) + chunk
            for frame_id, chunk in enumerate(chunks)
        ]

        self.__queue.extend(frames)

    def send_object(self, obj):
        stringified_object = json.dumps(obj)
        self.__queue_message(stringified_object)
        eventer.emit("process_message_queue")

    def init_message_listener(self, message_handler):
        def process_chunk(data):
            data_bytes = bytes(data)
            if len(data_bytes) < 2:
                return

            frame_id = data_bytes[0]
            total_frames = data_bytes[1]
            chunk = data_bytes[2:]

            self.__buffer.append(chunk)

            if len(self.__buffer) == total_frames:
                full_message = b"".join(self.__buffer)
                self.__buffer = []

                try:
                    decoded_message = full_message.decode('utf-8')
                    message_handler(json.loads(decoded_message))
                except:
                    print("Undecodable messages received")

        self.__tunnel.callback(process_chunk)
        
    def announce_start(self):
        self.send_object({"action": "program_start", "payload": {}})


    async def process_queue(self):
        if self.__is_sending:
            return

        if not self.__queue:
            return

        self.__is_sending = True

        if self.__queue:
            data = self.__queue.pop(0)
            size = len(data) + 3

            # Calculate wait time based on the message size
            wait_ms = size * 1_000 // self.__BANDWIDTH

            self.__tunnel.send(data)
            await runloop.sleep_ms(wait_ms)

        self.__is_sending = False
        eventer.emit("process_message_queue")

tunnel = hub.config["module_tunnel"]
messenger = Messenger(tunnel)

eventer.subscribe("process_message_queue", messenger.process_queue)


class EventListener:
    def __init__(self, condition_func, callback):
        self.__condition_func = condition_func
        self.__callback = callback
        self.__last_condition = False# Track previous condition

    async def listen(self):
        while True:
            current_condition = self.__condition_func()

            # Trigger callback only when condition starts returning True
            if current_condition and not self.__last_condition:
                await self.__callback()

            self.__last_condition = current_condition
            await runloop.sleep_ms(50)

def is_left_button_clicked():
    return bool(hub.button.pressed(hub.button.LEFT))

async def on_left_button_click():
    print("yay")
    messenger.send_object({"action": "ping", "payload": {}})

left_button_click_listener = EventListener(is_left_button_clicked, on_left_button_click)

events_listener = EventListener(eventer.is_queue_non_empty, eventer.process)

def handle_tunnel_message(message):
    print("message with following action received: ", message["action"])

messenger.init_message_listener(handle_tunnel_message)
messenger.announce_start()

runloop.run(left_button_click_listener.listen(), events_listener.listen())


`;

const crawler = ({ distanceSensorPort, smallMotorPort, smallMotorSpeed, bigMotorPort, bigMotorSpeed }: any) => `
import runloop, hub, json, math, random

class Eventer:
    def __init__(self):
        self.__subscribers = {}
        self.__queue = []

    def subscribe(self, event_name, callback):
        if event_name not in self.__subscribers:
            self.__subscribers[event_name] = []
        self.__subscribers[event_name].append(callback)

    def emit(self, event_name):
        # Instead of recursive calls, just queue the event
        self.__queue.append(event_name)

    async def process(self):
        while self.__queue:
            event_name = self.__queue.pop(0)
            runloop.run(*[callback() for callback in self.__subscribers[event_name]])

    def is_queue_non_empty(self):
        return bool(self.__queue)

eventer = Eventer()

class Messenger():
    def __init__(self, tunnel):
        self.__tunnel = tunnel
        self.__queue = []
        self.__is_sending = False
        self.__buffer = []

        self.__BANDWIDTH = 8192 // 16
        self.__MAX_PACKET_SIZE = 509 # assume it's always default
        # [max message size] = [max packet size] - [number of bytes for storing message code, length, frameId, totalFrames]
        self.__MAX_MESSAGE_SIZE = self.__MAX_PACKET_SIZE - 5 # 1 for ID, 2 for length, 1 for frameId, 1 for frameTotal


    def __queue_message(self, message):
        # encoding the message
        encoded_full_message = message.encode('utf-8')

        chunks = [
            encoded_full_message[i:i + self.__MAX_MESSAGE_SIZE]
            for i in range(0, len(encoded_full_message), self.__MAX_MESSAGE_SIZE)
        ]

        total_frames = len(chunks)

        frames = [
            bytes([frame_id, total_frames]) + chunk
            for frame_id, chunk in enumerate(chunks)
        ]

        self.__queue.extend(frames)

    def send_object(self, obj):
        stringified_object = json.dumps(obj)
        self.__queue_message(stringified_object)
        eventer.emit("process_message_queue")

    def init_message_listener(self, message_handler):
        def process_chunk(data):
            data_bytes = bytes(data)
            if len(data_bytes) < 2:
                return

            frame_id = data_bytes[0]
            total_frames = data_bytes[1]
            chunk = data_bytes[2:]

            self.__buffer.append(chunk)

            if len(self.__buffer) == total_frames:
                full_message = b"".join(self.__buffer)
                self.__buffer = []
                
                try:
                    decoded_message = full_message.decode('utf-8')
                    message_handler(json.loads(decoded_message))
                except Exception as e:
                    print("error received ", e)

        self.__tunnel.callback(process_chunk)
        
    def announce_start(self):
        self.send_object({"action": "program_start", "payload": {}})


    async def process_queue(self):
        if self.__is_sending:
            return

        if not self.__queue:
            return

        self.__is_sending = True

        if self.__queue:
            data = self.__queue.pop(0)
            size = len(data) + 3

            # Calculate wait time based on the message size
            wait_ms = size * 1_000 // self.__BANDWIDTH

            self.__tunnel.send(data)
            await runloop.sleep_ms(wait_ms)

        self.__is_sending = False
        eventer.emit("process_message_queue")

tunnel = hub.config["module_tunnel"]
messenger = Messenger(tunnel)

eventer.subscribe("process_message_queue", messenger.process_queue)


class EventListener:
    def __init__(self, condition_func, callback):
        self.__condition_func = condition_func
        self.__callback = callback
        self.__last_condition = False# Track previous condition

    async def listen(self):
        while True:
            current_condition = self.__condition_func()

            # Trigger callback only when condition starts returning True
            if current_condition and not self.__last_condition:
                await self.__callback()

            self.__last_condition = current_condition
            await runloop.sleep_ms(50)

from hub import light_matrix, port
import distance_sensor


DISTANCE_SENSOR_PORT = port.${distanceSensorPort}
BIG_MOTOR_PORT = port.${bigMotorPort}
SMALL_MOTOR_PORT = port.${smallMotorPort}
SMALL_MOTOR_SPEED = math.floor(${smallMotorSpeed} * 1110 / 100)
BIG_MOTOR_SPEED = math.floor(${bigMotorSpeed} * 1050 / 100)

HAPPY_EMOTION = [100, 100, 0, 100, 100, 100, 100, 0, 100, 100, 0, 0, 0, 0, 0, 100, 0, 0, 0, 100, 0, 100, 100, 100, 0]
SAD_EMOTION = [100, 100, 0, 100, 100, 100, 100, 0, 100, 100, 0, 0, 0, 0, 0, 0, 100, 100, 100, 0, 100, 0, 0, 0, 100]
NEUTRAL_EMOTION = [100, 100, 0, 100, 100, 100, 100, 0, 100, 100, 0, 0, 0, 0, 0, 0, 100, 100, 100, 0, 0, 0, 0, 0, 0]

def show_emotion(emotion_array):
    light_matrix.show(emotion_array)


def get_distance_measurement():
    try:
        return math.floor(distance_sensor.distance(DISTANCE_SENSOR_PORT) / 10)
    except:
        return -1

def is_distance_ok():
    sensor_value = get_distance_measurement()

    if sensor_value <= 20:
        messenger.send_object({"action": "too_close", "payload": {}})
        return False
    if sensor_value >= 150:
        messenger.send_object({"action": "too_far", "payload": {}})
        return False

    return True

class QLearner:
    def __init__(self):
        self.motor_positions = [(0, 0), (290, 40), (330, 250), (60, 250)]
        self.q_table = [
            [0 if i != j else None for j in range((len(self.motor_positions)))]
            for i in range(len(self.motor_positions))
        ]
        self.reward_table = [
            [None for _ in range((len(self.motor_positions)))]
            for _ in range(len(self.motor_positions))
        ]
        self.current_state = 0
        self.alpha = 1
        self.gamma = 1
        self.epsilon = 0
        self.current_action = None
        self.action_fulfillment = ["unpicked", "unpicked"]
        self.before_action_distance = 0
        self.wait_before_next_move = True
        self.paused = False

    def reset_experiment(self):
        self.q_table = [
            [0 if i != j else None for j in range((len(self.motor_positions)))]
            for i in range(len(self.motor_positions))
        ]
        self.reward_table = [
            [None for _ in range((len(self.motor_positions)))]
            for _ in range(len(self.motor_positions))
        ]
        self.current_state = 0
        self.current_action = None
        self.action_fulfillment = ["unpicked", "unpicked"]
        self.paused = True
        self.gamma = 0
        self.epsilon = 0

    def pick_action(self):
        if self.current_action is not None:
            return

        if random.random() < self.epsilon:
            action_type = "exploration"
            valid_actions = [a for a in range(4) if a != self.current_state]
            
            # Just so that the training process doesn't last eternity until the crawler fills all None's
            actions_with_none_reward = [
                a for a in valid_actions if self.reward_table[self.current_state][a] is None
            ]
            
            if actions_with_none_reward:
                # If there are actions with None reward, pick one of them
                action = random.choice(actions_with_none_reward)
            else:
                # Otherwise, choose a random valid action
                action = random.choice(valid_actions)
        else:
            action_type = "exploitation"
            # Exploit: choose the best action(s) from Q-table
            state_actions = self.q_table[self.current_state]
            # Get (action, q_value) for all valid actions
            valid_actions = [
                (a, q)
                for a, q in enumerate(state_actions)
                if q is not None and a != self.current_state
            ]
            max_q = max(q for _, q in valid_actions)
            action = min([a for a, q in valid_actions if q == max_q])
        

        self.current_action = action
        self.action_fulfillment = ["picked", "picked"]
        messenger.send_object(
            {
                "action": "action_update",
                "payload": {
                    "action": self.current_action,
                    "status": "picked",
                    "type": action_type,
                },
            }
        )

    def assign_reward(self):
        prev_state = self.current_state
        prev_action = self.current_action

        # Independent from the sensor reading, the current state is new and the current action is None'd (in case sensor fails to read)
        self.current_state = self.current_action
        self.current_action = None
        self.action_fulfillment = ["unpicked", "unpicked"]

        sensor_value = get_distance_measurement()

        reward = sensor_value - self.before_action_distance

        if reward > 0:
            eventer.emit("show_happy")
        elif reward < 0:
            eventer.emit("show_sad")
        elif reward == 0:
            eventer.emit("show_neutral")
        
        self.reward_table[prev_state][prev_action] = reward
        current_q = self.q_table[prev_state][prev_action]

        # Find the maximum Q-value for the next state
        max_next_q = max(
            [q for q in self.q_table[prev_action] if q is not None], default=0
        )

        # Update Q-value using the Q-learning formula
        new_q = (1 - self.alpha) * current_q + self.alpha * (
            reward + self.gamma * max_next_q
        )
        self.q_table[prev_state][prev_action] = new_q

        messenger.send_object(
            {
                "action": "action_update",
                "payload": {"status": "unpicked"},
            }
        )
        messenger.send_object(
            {
                "action": "tables_update",
                "payload": {
                    "state": prev_state,
                    "action": prev_action,
                    "reward": reward,
                    "q": new_q,
                },
            }
        )

    def set_action_fulfillment(self, limb_ix, new_status):
        self.action_fulfillment[limb_ix] = new_status

        if (
            self.action_fulfillment[0] == "done"
            and self.action_fulfillment[1] == "done"
        ):
            eventer.emit("action_done")

    def do_action(self):
        if self.current_action is None:
            return

        sensor_value = get_distance_measurement()

        messenger.send_object(
            {
                "action": "action_update",
                "payload": {"action": self.current_action, "status": "started"},
            }
        )
        self.before_action_distance = sensor_value
        eventer.emit("move_limbs")



q_learner = QLearner()

import motor

async def reset_motors():
    await motor.run_to_absolute_position(BIG_MOTOR_PORT, q_learner.motor_positions[q_learner.current_state][0], BIG_MOTOR_SPEED)
    await motor.run_to_absolute_position(SMALL_MOTOR_PORT, q_learner.motor_positions[q_learner.current_state][1], SMALL_MOTOR_SPEED)


async def main_run():
    await reset_motors()

    if not is_distance_ok():
        return

    if q_learner.wait_before_next_move:
        q_learner.paused = True

    if not q_learner.paused:
        q_learner.do_action()

async def continue_run():
    q_learner.paused = False

    if q_learner.current_action is None:
        q_learner.pick_action()

    if not is_distance_ok():
        return
    
    q_learner.do_action()

async def move_limb1_handler():
    q_learner.set_action_fulfillment(0, "started")
    await motor.run_to_absolute_position(BIG_MOTOR_PORT, q_learner.motor_positions[q_learner.current_action][0], BIG_MOTOR_SPEED)
    q_learner.set_action_fulfillment(0, "done")

async def move_limb2_handler():
    q_learner.set_action_fulfillment(1, "started")
    await motor.run_to_absolute_position(SMALL_MOTOR_PORT, q_learner.motor_positions[q_learner.current_action][1], SMALL_MOTOR_SPEED)
    q_learner.set_action_fulfillment(1, "done")

from hub import motion_sensor

async def action_done_callback():
    messenger.send_object(
        {
            "action": "action_update",
            "payload": {"action": q_learner.current_action, "status": "done"},
        }
    )

    stable_time = 0
    while stable_time < 500:
        gyro_value = motion_sensor.angular_velocity(False)
        if all(v == 0 for v in gyro_value):
            await runloop.sleep_ms(50)
            stable_time += 50
        else:
            stable_time = 0

    messenger.send_object({"action": "state_update", "payload": {"state": q_learner.current_action}})

    q_learner.assign_reward()

    q_learner.pick_action()

    if not is_distance_ok():
        return
    
    if q_learner.wait_before_next_move:
        q_learner.paused = True

    if not q_learner.paused:
        q_learner.do_action()

async def reset():
    q_learner.reset_experiment()
    await reset_motors()

async def show_sad():
    show_emotion(SAD_EMOTION)

async def show_happy():
    show_emotion(HAPPY_EMOTION)

async def show_neutral():
    show_emotion(NEUTRAL_EMOTION)

eventer.subscribe("start_main", main_run)
eventer.subscribe("move_limbs", move_limb1_handler)
eventer.subscribe("move_limbs", move_limb2_handler)
eventer.subscribe("action_done", action_done_callback)
eventer.subscribe("continue", continue_run)
eventer.subscribe("reset", reset)
eventer.subscribe("show_happy", show_happy)
eventer.subscribe("show_sad", show_sad)
eventer.subscribe("show_neutral", show_neutral)



def is_right_button_clicked():
    return bool(hub.button.pressed(hub.button.RIGHT))

right_button_click_listener = EventListener(is_right_button_clicked, continue_run)

events_listener = EventListener(eventer.is_queue_non_empty, eventer.process)

def handle_tunnel_message(message):
    if "action" not in message:
        return

    action = message["action"]

    if action == "wait_before_next_move_update":
        q_learner.wait_before_next_move = message["payload"]["wait_before_next_move"]

    elif action == "continue":
        eventer.emit("continue")

    elif action == "pause":
        q_learner.paused = True

    elif action == "reset":
        eventer.emit("reset")

    elif action == "epsilon_update":
        q_learner.epsilon = message["payload"]["epsilon"]

    elif action == "think_future_update":
        q_learner.gamma = int(message["payload"]["think_future"])

    elif action == "code_start":
        q_learner.epsilon = message["payload"]["epsilon"]
        q_learner.q_table = [
            [None if i == j else val for j, val in enumerate(row)]
            for i, row in enumerate(message["payload"]["q_table"])
        ]
        q_learner.wait_before_next_move = message["payload"]["wait_before_next_move"]
        q_learner.current_state = message["payload"]["current_state"] if isinstance(message["payload"]["current_state"], int) else 0
        q_learner.paused = True
        q_learner.gamma = int(message["payload"]["think_future"])
        eventer.emit("start_main")
        
    elif action == "move_to":
        q_learner.epsilon = message["payload"]["epsilon"]
        q_learner.q_table = [
            [None if i == j else val for j, val in enumerate(row)]
            for i, row in enumerate(message["payload"]["q_table"])
        ]
        q_learner.wait_before_next_move = message["payload"]["wait_before_next_move"]
        q_learner.current_state = message["payload"]["current_state"] if isinstance(message["payload"]["current_state"], int) else 0
        q_learner.paused = True
        q_learner.gamma = int(message["payload"]["think_future"])
        eventer.emit("start_main")

    else:
        return


messenger.init_message_listener(handle_tunnel_message)
messenger.announce_start()

runloop.run(right_button_click_listener.listen(), events_listener.listen())

`;

const fruitPredictor = ({ distanceSensorPort, colorSensorPort }: any) => `

import runloop, hub, json

class Eventer:
    def __init__(self):
        self.__subscribers = {}
        self.__queue = []

    def subscribe(self, event_name, callback):
        if event_name not in self.__subscribers:
            self.__subscribers[event_name] = []
        self.__subscribers[event_name].append(callback)

    def emit(self, event_name):
        # Instead of recursive calls, just queue the event
        self.__queue.append(event_name)

    async def process(self):
        while self.__queue:
            event_name = self.__queue.pop(0)
            runloop.run(*[callback() for callback in self.__subscribers[event_name]])

    def is_queue_non_empty(self):
        return bool(self.__queue)

eventer = Eventer()

class Messenger():
    def __init__(self, tunnel):
        self.__tunnel = tunnel
        self.__queue = []
        self.__is_sending = False
        self.__buffer = []

        self.__BANDWIDTH = 8192 // 16
        self.__MAX_PACKET_SIZE = 509 # assume it's always default
        # [max message size] = [max packet size] - [number of bytes for storing message code, length, frameId, totalFrames]
        self.__MAX_MESSAGE_SIZE = self.__MAX_PACKET_SIZE - 5 # 1 for ID, 2 for length, 1 for frameId, 1 for frameTotal


    def __queue_message(self, message):
        # encoding the message
        encoded_full_message = message.encode('utf-8')

        chunks = [
            encoded_full_message[i:i + self.__MAX_MESSAGE_SIZE]
            for i in range(0, len(encoded_full_message), self.__MAX_MESSAGE_SIZE)
        ]

        total_frames = len(chunks)

        frames = [
            bytes([frame_id, total_frames]) + chunk
            for frame_id, chunk in enumerate(chunks)
        ]

        self.__queue.extend(frames)

    def send_object(self, obj):
        stringified_object = json.dumps(obj)
        self.__queue_message(stringified_object)
        eventer.emit("process_message_queue")

    def init_message_listener(self, message_handler):
        def process_chunk(data):
            data_bytes = bytes(data)
            if len(data_bytes) < 2:
                return

            frame_id = data_bytes[0]
            total_frames = data_bytes[1]
            chunk = data_bytes[2:]

            self.__buffer.append(chunk)

            if len(self.__buffer) == total_frames:
                full_message = b"".join(self.__buffer)
                self.__buffer = []

                try:
                    decoded_message = full_message.decode('utf-8')
                    message_handler(json.loads(decoded_message))
                except:
                    print("Undecodable messages received")

        self.__tunnel.callback(process_chunk)
        
    def announce_start(self):
        self.send_object({"action": "program_start", "payload": {}})


    async def process_queue(self):
        if self.__is_sending:
            return

        if not self.__queue:
            return

        self.__is_sending = True

        if self.__queue:
            data = self.__queue.pop(0)
            size = len(data) + 3

            # Calculate wait time based on the message size
            wait_ms = size * 1_000 // self.__BANDWIDTH

            self.__tunnel.send(data)
            await runloop.sleep_ms(wait_ms)

        self.__is_sending = False
        eventer.emit("process_message_queue")

tunnel = hub.config["module_tunnel"]
messenger = Messenger(tunnel)

eventer.subscribe("process_message_queue", messenger.process_queue)


class EventListener:
    def __init__(self, condition_func, callback):
        self.__condition_func = condition_func
        self.__callback = callback
        self.__last_condition = False# Track previous condition

    async def listen(self):
        while True:
            current_condition = self.__condition_func()

            # Trigger callback only when condition starts returning True
            if current_condition and not self.__last_condition:
                await self.__callback()

            self.__last_condition = current_condition
            await runloop.sleep_ms(50)


from hub import port

DISTANCE_SENSOR_PORT = port.${distanceSensorPort}
COLOR_SENSOR_PORT = port.${colorSensorPort}

import distance_sensor, color_sensor
from hub import light_matrix

def get_distance_measurement():
    try:
        return distance_sensor.distance(DISTANCE_SENSOR_PORT) / 10
    except:
        return None

def get_color_measurement():
    try:
        return color_sensor.rgbi(COLOR_SENSOR_PORT)
    except:
        return None

def feature_distance(dp1, dp2):
    return ((dp1["len"] - dp2["len"]) / 20) ** 2 + (
        (dp1["color"][1] - dp2["color"][1]) / 1024
    ) ** 2


def most_common_label(labels):
    label_count = {}
    for label in labels:
        label_count[label] = label_count.get(label, 0) + 1
    return max(label_count, key=label_count.get)

class KNN:
    def __init__(self):
        self.mode = "train"
        self.data = []
        self.current_class = None
        self.cache = {"color": None, "len": None}
        self.current_id = 0
        self.k = 3
        self.class_names = {}

    def change_mode(self, new_mode):
        self.mode = new_mode

    def change_current_class(self, new_current_class, class_name):
        self.current_class = new_current_class
        self.class_names[new_current_class] = class_name

    def check_and_add_dp(self):
        if self.cache["color"] is None or self.cache["len"] is None:
            return
        data_obj = {
            "id": str(self.current_id),
            "len": self.cache["len"],
            "color": self.cache["color"],
            "label": self.current_class,
        }
        self.current_id += 1
        self.data.append(data_obj)
        self.clean_cache()
        messenger.send_object({"action": "add_point", "payload": data_obj})

    def log_color(self, value):
        self.cache["color"] = value

    def log_length(self, value):
        self.cache["len"] = value

    def check_and_infer(self):
        if self.cache["color"] is None or self.cache["len"] is None:
            return
        new_data_obj = {"len": self.cache["len"], "color": self.cache["color"]}
        distances = []
        for dp in self.data:
            dist = feature_distance(new_data_obj, dp)
            distances.append((dist, dp["label"], dp["id"]))
        distances.sort(key=lambda x: x[0])
        nearest_neighbors = distances[: self.k]
        neighbor_ids = [neighbor[2] for neighbor in nearest_neighbors]
        neighbor_labels = [neighbor[1] for neighbor in nearest_neighbors]
        predicted_label = most_common_label(neighbor_labels)
        data_obj = {
            "predicted_label": predicted_label,
            "nearest_neighbors": neighbor_ids,
            "len": new_data_obj["len"],
            "color": new_data_obj["color"],
        }
        messenger.send_object({"action": "inference_result", "payload": data_obj})
        self.clean_cache()

        return (
            self.class_names[predicted_label]
            if predicted_label in self.class_names
            else predicted_label
        )

    def clean_cache(self):
        self.log_color(None)
        self.log_length(None)
        self.light_up_matrix()

    def delete_datapoint(self, dp_id):
        self.data = [dp for dp in self.data if dp["id"] != dp_id]

    def change_datapoint_label(self, dp_id, new_label):
        for dp in self.data:
            if dp["id"] == dp_id:
                dp["label"] = new_label
                break

    def change_k(self, new_k):
        self.k = new_k

    def light_up_matrix(self):
        light_matrix.clear()

        if self.cache["len"] is not None:
            light_matrix.set_pixel(0, 4, 100)

        if self.cache["color"] is not None:
            light_matrix.set_pixel(4, 4, 100)

knn = KNN()

def is_left_button_clicked():
    return bool(hub.button.pressed(hub.button.LEFT))

async def on_left_button_click():
    sensor_value = get_distance_measurement()
    if sensor_value is None or sensor_value >= 21:
        return

    if knn.mode == "train":
        if knn.current_class is None:
            await light_matrix.write("No class selected")
            knn.light_up_matrix()
            return
        knn.log_length(sensor_value)
        knn.check_and_add_dp()

    elif knn.mode == "infer":
        knn.log_length(sensor_value)
        predicted_label = knn.check_and_infer()
        if predicted_label is not None:
            await light_matrix.write(predicted_label)

    knn.light_up_matrix()

def is_right_button_clicked():
    return bool(hub.button.pressed(hub.button.RIGHT))

async def on_right_button_click():
    sensor_value = get_color_measurement()
    if sensor_value is None:
        return

    if knn.mode == "train":
        if knn.current_class is None:
            await light_matrix.write("No class selected") # TODO: add translations
            knn.light_up_matrix()
            return
        knn.log_color(sensor_value)
        knn.check_and_add_dp()

    elif knn.mode == "infer":
        knn.log_color(sensor_value)
        predicted_label = knn.check_and_infer()
        if predicted_label is not None:
            await light_matrix.write(predicted_label)

    knn.light_up_matrix()

left_button_click_listener = EventListener(is_left_button_clicked, on_left_button_click)
right_button_click_listener = EventListener(is_right_button_clicked, on_right_button_click)

events_listener = EventListener(eventer.is_queue_non_empty, eventer.process)

def handle_tunnel_message(message):
    if "action" not in message:
        return

    action = message["action"]

    if action == "change_class":
        knn.change_current_class(message["payload"]["class"], message["payload"]["class_name"])

    elif action == "change_mode":
        new_mode = message["payload"]["mode"]
        if knn.mode == new_mode:
            return
        knn.change_mode(message["payload"]["mode"])

    elif action == "delete_datapoint":
        knn.delete_datapoint(message["payload"]["id"])

    elif action == "change_datapoint_label":
        knn.change_datapoint_label(message["payload"]["id"], message["payload"]["new_label"])

    elif action == "change_k":
        knn.change_k(message["payload"]["k"])

    elif action == "startup_functionality":
        knn.change_current_class(message["payload"]["class"], message["payload"]["class_name"])
        knn.change_mode(message["payload"]["mode"])
        knn.data = message["payload"]["data"]
        knn.k = message["payload"]["k"]

        # Find the largest "id" in the data
        if len(knn.data) > 0:
            max_id = max(int(item["id"]) for item in knn.data)
        else:
            max_id = -1
        knn.current_id = max_id + 1

    else:
        return

messenger.init_message_listener(handle_tunnel_message)
messenger.announce_start()

runloop.run(left_button_click_listener.listen(), right_button_click_listener.listen(), events_listener.listen())


`;

const pitcher = ({ distanceSensorPort, leftMotorPort, rightMotorPort, isInverted }: any) => `

import runloop, hub, json, math

class Eventer:
    def __init__(self):
        self.__subscribers = {}
        self.__queue = []

    def subscribe(self, event_name, callback):
        if event_name not in self.__subscribers:
            self.__subscribers[event_name] = []
        self.__subscribers[event_name].append(callback)

    def emit(self, event_name):
        # Instead of recursive calls, just queue the event
        self.__queue.append(event_name)

    async def process(self):
        while self.__queue:
            event_name = self.__queue.pop(0)
            runloop.run(*[callback() for callback in self.__subscribers[event_name]])

    def is_queue_non_empty(self):
        return bool(self.__queue)

eventer = Eventer()

class Messenger():
    def __init__(self, tunnel):
        self.__tunnel = tunnel
        self.__queue = []
        self.__is_sending = False
        self.__buffer = []

        self.__BANDWIDTH = 8192 // 16
        self.__MAX_PACKET_SIZE = 509 # assume it's always default
        # [max message size] = [max packet size] - [number of bytes for storing message code, length, frameId, totalFrames]
        self.__MAX_MESSAGE_SIZE = self.__MAX_PACKET_SIZE - 5 # 1 for ID, 2 for length, 1 for frameId, 1 for frameTotal


    def __queue_message(self, message):
        # encoding the message
        encoded_full_message = message.encode('utf-8')

        chunks = [
            encoded_full_message[i:i + self.__MAX_MESSAGE_SIZE]
            for i in range(0, len(encoded_full_message), self.__MAX_MESSAGE_SIZE)
        ]

        total_frames = len(chunks)

        frames = [
            bytes([frame_id, total_frames]) + chunk
            for frame_id, chunk in enumerate(chunks)
        ]

        self.__queue.extend(frames)

    def send_object(self, obj):
        stringified_object = json.dumps(obj)
        self.__queue_message(stringified_object)
        eventer.emit("process_message_queue")

    def init_message_listener(self, message_handler):
        def process_chunk(data):
            data_bytes = bytes(data)
            if len(data_bytes) < 2:
                return

            frame_id = data_bytes[0]
            total_frames = data_bytes[1]
            chunk = data_bytes[2:]

            self.__buffer.append(chunk)

            if len(self.__buffer) == total_frames:
                full_message = b"".join(self.__buffer)
                self.__buffer = []

                try:
                    decoded_message = full_message.decode('utf-8')
                    message_handler(json.loads(decoded_message))
                except:
                    print("Undecodable messages received")

        self.__tunnel.callback(process_chunk)
        
    def announce_start(self):
        self.send_object({"action": "program_start", "payload": {}})


    async def process_queue(self):
        if self.__is_sending:
            return

        if not self.__queue:
            return

        self.__is_sending = True

        if self.__queue:
            data = self.__queue.pop(0)
            size = len(data) + 3

            # Calculate wait time based on the message size
            wait_ms = size * 1_000 // self.__BANDWIDTH

            self.__tunnel.send(data)
            await runloop.sleep_ms(wait_ms)

        self.__is_sending = False
        eventer.emit("process_message_queue")

tunnel = hub.config["module_tunnel"]
messenger = Messenger(tunnel)

eventer.subscribe("process_message_queue", messenger.process_queue)


class EventListener:
    def __init__(self, condition_func, callback):
        self.__condition_func = condition_func
        self.__callback = callback
        self.__last_condition = False# Track previous condition

    async def listen(self):
        while True:
            current_condition = self.__condition_func()

            # Trigger callback only when condition starts returning True
            if current_condition and not self.__last_condition:
                await self.__callback()

            self.__last_condition = current_condition
            await runloop.sleep_ms(50)

from hub import port

DISTANCE_SENSOR_PORT = port.${distanceSensorPort}
LEFT_MOTOR_PORT = port.${leftMotorPort}
RIGHT_MOTOR_PORT = port.${rightMotorPort}
ROTATION_SIGN = ${Number(!isInverted) * 2 - 1}

import distance_sensor


def get_distance_measurement():
    try:
        return distance_sensor.distance(DISTANCE_SENSOR_PORT) / 10
    except:
        return -1

class Pingponger:
    def __init__(self):
        self.mode = "train"
        self.motor_pair = None
        self.data = []
        self.current_id = 0
        self.cache = {"distance": None, "power": None}
        self.best_parameters = [None, None]
        self.current_parameters = [None, None]
        self.infer_distance = None
        self.train_power = 50
        self.is_shooting = False

    def change_mode(self, new_mode):
        self.mode = new_mode
        self.infer_distance = None

    def change_power(self, new_power):
        self.train_power = new_power

    def calc_infer(self):
        pred_power = math.floor(
            self.current_parameters[0] * self.infer_distance
            + self.current_parameters[1]
        )
        if pred_power > 100:
            pred_power = 100
        if pred_power < 20:
            pred_power = 20

        return pred_power

    def log_distance(self, distance):
        self.cache["distance"] = distance

    def log_power(self):
        self.cache["power"] = self.train_power
        return self.cache["power"]

    def check_and_add_dp(self):
        if self.cache["power"] is None or self.cache["distance"] is None:
            return

        data_obj = {
            "id": str(self.current_id),
            "power": self.cache["power"],
            "distance": self.cache["distance"],
        }
        self.current_id += 1
        self.data.append(data_obj)

        self.cache = {"power": None, "distance": None}

        messenger.send_object({"action": "add_point", "payload": data_obj})
        self.recalculate_best_parameters()

    def recalculate_best_parameters(self):
        if len(self.data) < 2:
            return  # Need at least two points to calculate a linear relationship

        distances = [point["distance"] for point in self.data]
        powers = [point["power"] for point in self.data]

        N = len(self.data)
        sum_x = sum(distances)
        sum_y = sum(powers)
        sum_x_squared = sum(x * x for x in distances)
        sum_xy = sum(x * y for x, y in zip(distances, powers))

        slope = (N * sum_xy - sum_x * sum_y) / (N * sum_x_squared - sum_x**2)
        intercept = (sum_y - slope * sum_x) / N

        old_best = self.best_parameters
        self.best_parameters = [slope, intercept]

        if not self.current_parameters[0] or (
            self.current_parameters[0] == old_best[0]
            and self.current_parameters[1] == old_best[1]
        ):
            self.current_parameters = self.best_parameters

    def log_infer_distance(self, logged_distance):
        self.infer_distance = logged_distance
        data_obj = {
            "distance": logged_distance,
        }
        messenger.send_object({"action": "infer_distance", "payload": data_obj})

    def change_parameters(self, parameters):
        self.current_parameters = parameters

    def set_best_parameters(self):
        self.current_parameters = self.best_parameters

    def delete_datapoint(self, dp_id):
        self.data = [dp for dp in self.data if dp["id"] != str(dp_id)]
        self.recalculate_best_parameters()

    def upload_datapoints(self, dps):
        self.data = dps
        self.recalculate_best_parameters()
        self.current_id = len(dps) + 1


pingponger = Pingponger()

import motor_pair

motor_pair.pair(motor_pair.PAIR_1, LEFT_MOTOR_PORT, RIGHT_MOTOR_PORT)

from hub import light_matrix

async def show_no():
    light_matrix.show_image(light_matrix.IMAGE_NO)
    await runloop.sleep_ms(500)
    light_matrix.clear()


def is_left_button_clicked():
    return bool(hub.button.pressed(hub.button.LEFT))

async def on_left_button_click():
    if pingponger.is_shooting:
        return
    if pingponger.mode == "train":
        pingponger.log_power()
        shooting_power = pingponger.train_power

    elif pingponger.mode == "infer":
        if pingponger.infer_distance is None:
            await show_no()
            return
        shooting_power = pingponger.calc_infer()

    pingponger.is_shooting = True
    
    await motor_pair.move_for_degrees(motor_pair.PAIR_1, 360, 0, velocity=int(ROTATION_SIGN * 1110 * shooting_power / 100), acceleration=10000)

    pingponger.is_shooting = False

left_button_click_listener = EventListener(is_left_button_clicked, on_left_button_click)


def is_right_button_clicked():
    return bool(hub.button.pressed(hub.button.RIGHT))

async def on_right_button_click():
    if pingponger.is_shooting:
        return
    sensor_value = get_distance_measurement()
    if sensor_value is None or sensor_value >= 130 or sensor_value <= 5:
        await show_no()
        pingponger.infer_distance = None
        return

    if pingponger.mode == "train":
        pingponger.log_distance(sensor_value)
        pingponger.check_and_add_dp()
    elif pingponger.mode == "infer":
        pingponger.log_infer_distance(sensor_value)

right_button_click_listener = EventListener(is_right_button_clicked, on_right_button_click)

eventer.subscribe("shoot", on_left_button_click)
eventer.subscribe("measure", on_right_button_click)

events_listener = EventListener(eventer.is_queue_non_empty, eventer.process)

def handle_tunnel_message(message):
    if "action" not in message:
        return

    action = message["action"]

    if action == "change_power":
        pingponger.change_power(message["payload"]["power"])

    elif action == "change_mode":
        pingponger.change_mode(message["payload"]["mode"])

    elif action == "delete_datapoint":
        pingponger.delete_datapoint(message["payload"]["id"])

    elif action == "code_start":
        pingponger.change_mode(message["payload"]["mode"])
        pingponger.upload_datapoints(message["payload"]["datapoints"])
        pingponger.change_power(message["payload"]["power"])
        pingponger.infer_distance = message["payload"]["infer_distance"]

    elif action == "pitch_ball":
        eventer.emit("shoot")
    
    elif action == "measure_distance":
        eventer.emit("measure")

    else:
        return

messenger.init_message_listener(handle_tunnel_message)
messenger.announce_start()

runloop.run(left_button_click_listener.listen(), right_button_click_listener.listen(), events_listener.listen())

`;

export default { boilerplate, crawler, fruitPredictor, pitcher };
