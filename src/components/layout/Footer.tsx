import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">드라이브온</span>
            </div>
            <p className="text-sm leading-relaxed">
              언제나 편리하고 안전한 렌트카 서비스를 제공합니다.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/cars" className="hover:text-white transition-colors">차량 둘러보기</Link></li>
              <li><Link href="/booking" className="hover:text-white transition-colors">예약하기</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-white transition-colors">이용방법</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">지점안내</h4>
            <ul className="space-y-2 text-sm">
              <li>서울 강남점</li>
              <li>인천공항점</li>
              <li>부산 해운대점</li>
              <li>제주공항점</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">고객센터</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-white text-lg font-bold">1588-0000</li>
              <li>평일 09:00 ~ 18:00</li>
              <li>주말 10:00 ~ 17:00</li>
              <li className="mt-3">
                <a href="mailto:help@driveon.kr" className="hover:text-white transition-colors">
                  help@driveon.kr
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2024 드라이브온. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">이용약관</Link>
            <Link href="#" className="hover:text-white transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
