import SwiftUI
import AVFoundation

struct ContentView: View {
    @StateObject private var audioManager = AudioManager()
    @State private var transcript: String = ""
    @State private var responseText: String = ""

    var body: some View {
        VStack {
            Text("Vero Assistant").font(.title)
            TextEditor(text: $transcript).frame(height:100)
            Button(action: {
                if audioManager.isRecording {
                    audioManager.stopRecording { url in
                        NetworkManager.shared.transcribeAudio(url: url) { result in
                            switch result {
                            case .success(let text):
                                DispatchQueue.main.async {
                                    transcript = text
                                }
                                NetworkManager.shared.chat(query: text) { response in
                                    switch response {
                                    case .success(let reply):
                                        DispatchQueue.main.async {
                                            responseText = reply
                                            audioManager.speak(reply)
                                        }
                                    case .failure(_):
                                        break
                                    }
                                }
                            case .failure(_):
                                break
                            }
                        }
                    }
                } else {
                    audioManager.startRecording()
                }
            }) {
                Image(systemName: audioManager.isRecording ? "stop.circle" : "mic.circle")
                    .resizable()
                    .frame(width: 64, height: 64)
                    .padding()
            }
            Text(responseText).padding()
        }
        .padding()
    }
}
