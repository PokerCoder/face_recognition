from flask import Flask, jsonify, render_template, request, redirect
import face_recognition
import json

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/', methods=['GET', 'POST'])
def upload_image():
    if request.method == 'POST':
        if 'file' not in request.files:
            return redirect(request.url)

        file = request.files['file']

        if file.filename == '':
            return redirect(request.url)

        if file and allowed_file(file.filename):
            if "name" in request.form:
                return detect_faces_in_image(file, request.form["name"])
            else:
                return detect_faces_in_image(file, "")

    return render_template("index.html")


def update_data():
    global known_face_ids, known_face_names, known_face_encodings, known_face_permissions, known_faces
    
    known_face_ids = []
    known_face_names = []
    known_face_encodings = []
    known_face_permissions = []
    
    data_file = open('data.json')
    known_faces = json.load(data_file)
    
    for data in known_faces:
        known_face_ids.append(data["id"])
        known_face_names.append(data["name"])
        known_face_encodings.append(data["encoding"])
        known_face_permissions.append(data["permission"])
    
    data_file.close()

update_data()

def detect_faces_in_image(file_stream, name_of_person):
    
    global kn

    received_img = face_recognition.load_image_file(file_stream)
    received_face_encoding = face_recognition.face_encodings(received_img)

    face_found = False
    is_exists = False
    name = "unkown"
    permission = False

    if len(received_face_encoding) > 0:
        face_found = True
        match_results = face_recognition.compare_faces(
            known_face_encodings, received_face_encoding[0])

        for i, match_result in enumerate(match_results):
            if match_result:
                is_exists = True
                name = known_face_names[i]
                permission = bool(known_face_permissions[i])
        
        if not is_exists and name_of_person != '':
            
            new_data = {
                "id": len(known_face_ids),
                "name": name_of_person,
                "encoding": received_face_encoding[0].tolist(),
                "permission": 0
            }
            
            known_faces.append(new_data)
            
            with open("data.json", "w") as jsonFile:
                json.dump(known_faces, jsonFile)
                jsonFile.close()
            
            update_data()


    result = {
        "face_found_in_image": face_found,
        "is_exists": is_exists,
        "name": name,
        "permission": permission
    }

    return jsonify(result)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)
