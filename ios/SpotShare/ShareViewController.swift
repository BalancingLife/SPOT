import UIKit
import MobileCoreServices
import UniformTypeIdentifiers

final class ShareViewController: UIViewController {

  private let suiteName = "group.com.spot.app"
  private let tokenKey = "accessToken"
  private let latestResultKey = "latestAnalyzeResult"

  // 서버
  private let baseURL = "http://52.78.23.132:8080"
  private let analyzePath = "/analyze"

  // UI
  private let titleLabel = UILabel()
  private let actionButton = UIButton(type: .system)
  private let activity = UIActivityIndicatorView(style: .medium)

  override func viewDidLoad() {
    super.viewDidLoad()

    setupUI()

    NSLog("[SpotShare] viewDidLoad")

    // 1) 토큰 읽기
    let token = readToken()
    if token.isEmpty {
      NSLog("[SpotShare] ❌ token empty -> show login needed")
      showDoneUI(message: "로그인이 필요해요.", buttonTitle: "앱으로 가기")
      return
    }

    // 2) 공유된 URL 추출
    extractFirstURL { [weak self] urlString in
      guard let self else { return }

      guard let urlString, !urlString.isEmpty else {
        NSLog("[SpotShare] ❌ No URL found in share items")
        self.showDoneUI(message: "지원하지 않는 공유 형식이에요.", buttonTitle: "닫기")
        return
      }

      NSLog("[SpotShare] ✅ URL: \(urlString)")

      // 3) /analyze 호출
      self.callAnalyze(url: urlString, token: token)
    }
  }

  // MARK: - UI

  private func setupUI() {
    view.backgroundColor = .systemBackground

    titleLabel.textAlignment = .center
    titleLabel.numberOfLines = 2
    titleLabel.font = .systemFont(ofSize: 16, weight: .semibold)
    titleLabel.text = "저장 중…"

    actionButton.setTitle("앱으로 가기", for: .normal)
    actionButton.titleLabel?.font = .systemFont(ofSize: 16, weight: .bold)
    actionButton.isHidden = true
    actionButton.addTarget(self, action: #selector(onTapButton), for: .touchUpInside)

    activity.hidesWhenStopped = true
    activity.startAnimating()

    [titleLabel, activity, actionButton].forEach {
      $0.translatesAutoresizingMaskIntoConstraints = false
      view.addSubview($0)
    }

    NSLayoutConstraint.activate([
      titleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      titleLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -20),
      titleLabel.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 16),
      titleLabel.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -16),

      activity.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 16),
      activity.centerXAnchor.constraint(equalTo: view.centerXAnchor),

      actionButton.topAnchor.constraint(equalTo: activity.bottomAnchor, constant: 18),
      actionButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      actionButton.heightAnchor.constraint(equalToConstant: 44)
    ])
  }

  private func showDoneUI(message: String, buttonTitle: String) {
    DispatchQueue.main.async {
      self.activity.stopAnimating()
      self.titleLabel.text = message
      self.actionButton.setTitle(buttonTitle, for: .normal)
      self.actionButton.isHidden = false
    }
  }

  @objc private func onTapButton() {
    // 앱 열기
    if let url = URL(string: "spot://") {
      self.extensionContext?.open(url, completionHandler: { success in
        NSLog("[SpotShare] open app success=\(success)")
      })
    }
    // 익스텐션 닫기
    self.extensionContext?.completeRequest(returningItems: nil, completionHandler: nil)
  }

  // MARK: - Token

  private func readToken() -> String {
    let d = UserDefaults(suiteName: suiteName)
    let token = d?.string(forKey: tokenKey) ?? ""
    NSLog("[SpotShare] token len=\(token.count)")
    return token
  }

  private func saveLatestResult(_ json: String) {
    let d = UserDefaults(suiteName: suiteName)
    d?.set(json, forKey: latestResultKey)
    d?.synchronize()
  }

  // MARK: - Extract URL

  private func extractFirstURL(completion: @escaping (String?) -> Void) {
    guard let items = extensionContext?.inputItems as? [NSExtensionItem] else {
      completion(nil); return
    }

    // URL 우선
    for item in items {
      guard let providers = item.attachments else { continue }

      for provider in providers {
        if provider.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
          provider.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { data, error in
            if let error { NSLog("[SpotShare] load url error: \(error.localizedDescription)") }
            if let url = data as? URL {
              completion(url.absoluteString)
              return
            }
            completion(nil)
          }
          return
        }
      }
    }

    completion(nil)
  }

  // MARK: - API

  private func callAnalyze(url: String, token: String) {
    let endpoint = baseURL + analyzePath
    guard let reqURL = URL(string: endpoint) else {
      showDoneUI(message: "잘못된 서버 주소", buttonTitle: "닫기")
      return
    }

    var request = URLRequest(url: reqURL)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

    let body: [String: Any] = ["url": url]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)

    NSLog("[SpotShare] 🚀 POST \(endpoint)")
    activity.startAnimating()

    URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
      guard let self else { return }

      if let error {
        NSLog("[SpotShare] ❌ analyze error: \(error.localizedDescription)")
        self.showDoneUI(message: "저장 실패", buttonTitle: "닫기")
        return
      }

      let status = (response as? HTTPURLResponse)?.statusCode ?? -1
      let raw = String(data: data ?? Data(), encoding: .utf8) ?? ""

      NSLog("[SpotShare] ✅ status=\(status)")
      NSLog("[SpotShare] ✅ body=\(raw)")

      if status == 401 {
        // 토큰 만료/무효
        self.showDoneUI(message: "로그인이 만료됐어요.", buttonTitle: "앱으로 가기")
        return
      }

      if status >= 200 && status < 300 {
        self.saveLatestResult(raw)
        self.showDoneUI(message: "장소를 저장했어요.", buttonTitle: "앱으로 가기")
      } else {
        self.showDoneUI(message: "저장 실패", buttonTitle: "닫기")
      }

    }.resume()
  }
}
