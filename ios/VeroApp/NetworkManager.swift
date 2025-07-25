import Foundation

final class NetworkManager {
    static let shared = NetworkManager()
    private init() {}
    private let baseURL = URL(string: "http://localhost:8000")!

    func transcribeAudio(url: URL, completion: @escaping (Result<String, Error>) -> Void) {
        var request = URLRequest(url: baseURL.appendingPathComponent("/transcribe"))
        request.httpMethod = "POST"
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var data = Data()
        data.append("--\(boundary)\r\n".data(using: .utf8)!)
        data.append("Content-Disposition: form-data; name=\"file\"; filename=\"audio.m4a\"\r\n".data(using: .utf8)!)
        data.append("Content-Type: audio/m4a\r\n\r\n".data(using: .utf8)!)
        if let audioData = try? Data(contentsOf: url) {
            data.append(audioData)
        }
        data.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = data

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            if let data = data, let text = String(data: data, encoding: .utf8) {
                completion(.success(text))
            }
        }.resume()
    }

    func chat(query: String, completion: @escaping (Result<String, Error>) -> Void) {
        var request = URLRequest(url: baseURL.appendingPathComponent("/chat"))
        request.httpMethod = "POST"
        let json: [String: Any] = ["query": query]
        request.httpBody = try? JSONSerialization.data(withJSONObject: json)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            guard let data = data else {
                completion(.failure(NSError(domain: "", code: -1)))
                return
            }
            if let reply = String(data: data, encoding: .utf8) {
                completion(.success(reply))
            }
        }.resume()
    }
}
