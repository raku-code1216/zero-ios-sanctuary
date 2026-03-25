# zero-ios-sanctuary
The Digital Sanctuary. A minimalist iOS experience built with SwiftUI and Metal.

import SwiftUI
import MapKit

// MARK: - 狀態枚舉 (App 的四個核心階段)
enum ZeroState {
    case breathing   // 1. 初始呼吸狀態 (等待進入避難所)
    case collapsing  // 2. 崩塌過渡狀態 (捏碎雜訊)
    case oracle      // 3. 意圖啟示狀態 (AI 給出建議)
    case resonance   // 4. 寂靜共鳴狀態 (顯示地圖與其他光點)
}

struct ContentView: View {
    @State private var currentState: ZeroState = .breathing
    
    // 品牌顏色
    let brandLime = Color(red: 222/255, green: 255/255, blue: 154/255)
    
    var body: some View {
        ZStack {
            // 全域極簡黑背景
            Color(white: 0.02).ignoresSafeArea()
            
            // 根據當前狀態切換視圖
            switch currentState {
            case .breathing:
                BreathingView(color: brandLime) {
                    triggerCollapse()
                }
            case .collapsing:
                // 崩塌特效 (未來會換成 Metal Shader)
                CollapseView(color: brandLime)
            case .oracle:
                OracleView(color: brandLime) {
                    enterResonance()
                }
            case .resonance:
                ResonanceMapView(color: brandLime)
            }
        }
        // 隱藏狀態欄，達到全螢幕沉浸感
        .statusBar(hidden: true)
    }
    
    // MARK: - 狀態切換邏輯
    private func triggerCollapse() {
        // 震動回饋 (模擬捏碎玻璃)
        let generator = UIImpactFeedbackGenerator(style: .heavy)
        generator.impactOccurred()
        
        withAnimation(.easeIn(duration: 0.5)) {
            currentState = .collapsing
        }
        
        // 模擬粒子崩塌後，3秒進入 AI 啟示
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            withAnimation(.easeOut(duration: 1.0)) {
                currentState = .oracle
            }
        }
    }
    
    private func enterResonance() {
        withAnimation(.easeInOut(duration: 2.0)) {
            currentState = .resonance
        }
    }
}

// MARK: - 1. 呼吸視圖 (Breathing Space)
struct BreathingView: View {
    var color: Color
    var onLongPress: () -> Void
    
    @State private var scale: CGFloat = 1.0
    @State private var opacity: Double = 0.5
    
    var body: some View {
        VStack {
            Spacer()
            ZStack {
                Circle()
                    .stroke(color, lineWidth: 2)
                    .frame(width: 150, height: 150)
                    .scaleEffect(scale)
                    .opacity(opacity)
                    .animation(.easeInOut(duration: 4.0).repeatForever(autoreverses: true), value: scale)
                
                Text("0")
                    .font(.system(size: 40, weight: .ultraLight, design: .default))
                    .foregroundColor(color)
            }
            // 長按 1.5 秒觸發崩塌
            .onLongPressGesture(minimumDuration: 1.5) {
                onLongPress()
            }
            Spacer()
            Text("長按歸零")
                .font(.caption)
                .foregroundColor(.gray)
                .tracking(5)
                .padding(.bottom, 50)
        }
        .onAppear {
            scale = 1.15
            opacity = 0.8
        }
    }
}

// MARK: - 2. 崩塌過渡視圖 (Mock Collapse View)
// CTO 注意：這部分未來必須使用 UIViewRepresentable 包裝 Metal Shader 來實現真實粒子物理效果
struct CollapseView: View {
    var color: Color
    @State private var shrink = false
    
    var body: some View {
        ZStack {
            // 模擬粒子被吸入的簡單縮放效果
            Circle()
                .fill(color)
                .frame(width: shrink ? 0 : 300, height: shrink ? 0 : 300)
                .opacity(shrink ? 0 : 1)
                .blur(radius: shrink ? 0 : 20)
                .animation(.timingCurve(0.2, 0.8, 0.2, 1, duration: 2.5), value: shrink)
        }
        .onAppear {
            shrink = true
        }
    }
}

// MARK: - 3. 意圖啟示視圖 (Intent Oracle)
struct OracleView: View {
    var color: Color
    var onProceed: () -> Void
    @State private var showText = false
    
    // 這裡未來會接 CoreML 本地模型生成的文字
    let aiMessage = "世界正在門外，但這裡只有你。\n深呼吸，準備好再點擊。"
    
    var body: some View {
        VStack(spacing: 40) {
            Circle()
                .stroke(color.opacity(0.5), lineWidth: 1)
                .frame(width: 100, height: 100)
                .overlay(Text("0").foregroundColor(color.opacity(0.8)).font(.title))
            
            if showText {
                Text(aiMessage)
                    .font(.custom("PingFang HK", size: 16))
                    .fontWeight(.light)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .lineSpacing(10)
                    .transition(.opacity)
            }
        }
        .onAppear {
            withAnimation(.easeIn(duration: 1.5).delay(0.5)) {
                showText = true
            }
        }
        .onTapGesture {
            onProceed()
        }
    }
}

// MARK: - 4. 寂靜共鳴地圖 (Resonance Map)
struct ResonanceMapView: View {
    var color: Color
    @State private var region = MKCoordinateRegion(
        center: CLLocationCoordinate2D(latitude: 22.28, longitude: 114.15), // 預設香港中環
        span: MKCoordinateSpan(latitudeDelta: 5.0, longitudeDelta: 5.0)
    )
    
    var body: some View {
        ZStack {
            // 底層極簡地圖 (iOS 17+ MapKit API)
            Map(coordinateRegion: $region, interactionModes: [])
                .colorScheme(.dark) // 強制黑夜模式
                .ignoresSafeArea()
                .opacity(0.3) // 降低地圖亮度，突出粒子
            
            // 模擬其他用戶的共鳴光點 (未來由 WebSocket 驅動)
            Circle()
                .fill(color)
                .frame(width: 8, height: 8)
                .blur(radius: 2)
                .shadow(color: color, radius: 10, x: 0, y: 0)
                // 簡單呼吸動畫
                .modifier(PulseEffect())
            
            VStack {
                Spacer()
                Text("全球有 12,501 人正與你共享寂靜")
                    .font(.caption2)
                    .tracking(2)
                    .foregroundColor(.gray)
                    .padding(.bottom, 30)
            }
        }
    }
}

// 光點脈衝動畫 Modifier
struct PulseEffect: ViewModifier {
    @State private var isPulsing = false
    func body(content: Content) -> some View {
        content
            .scaleEffect(isPulsing ? 1.5 : 0.8)
            .opacity(isPulsing ? 0.3 : 1.0)
            .animation(.easeInOut(duration: 3.0).repeatForever(autoreverses: true), value: isPulsing)
            .onAppear { isPulsing = true }
    }
}

#Preview {
    ContentView()
}
