import Foundation
import AVFoundation

final class AudioManager: NSObject, ObservableObject {
    private var audioRecorder: AVAudioRecorder?
    private var speechSynthesizer = AVSpeechSynthesizer()

    @Published var isRecording = false

    func startRecording() {
        let audioSession = AVAudioSession.sharedInstance()
        do {
            try audioSession.setCategory(.playAndRecord, mode: .default, options: .defaultToSpeaker)
            try audioSession.setActive(true)

            let url = FileManager.default.temporaryDirectory.appendingPathComponent("recording.m4a")
            let settings: [String: Any] = [
                AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
                AVSampleRateKey: 44100,
                AVNumberOfChannelsKey: 1,
                AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
            ]

            audioRecorder = try AVAudioRecorder(url: url, settings: settings)
            audioRecorder?.delegate = self
            audioRecorder?.record()
            isRecording = true
        } catch {
            print("Failed to record: \(error)")
        }
    }

    func stopRecording(completion: @escaping (URL) -> Void) {
        audioRecorder?.stop()
        isRecording = false
        if let url = audioRecorder?.url {
            completion(url)
        }
    }

    func speak(_ text: String) {
        let utterance = AVSpeechUtterance(string: text)
        speechSynthesizer.speak(utterance)
    }
}

extension AudioManager: AVAudioRecorderDelegate {}
