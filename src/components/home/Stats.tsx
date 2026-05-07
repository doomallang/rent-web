const stats = [
  { value: "50,000+", label: "누적 예약 건수" },
  { value: "4.9", label: "평균 고객 만족도" },
  { value: "100+", label: "보유 차량 수" },
  { value: "10", label: "전국 지점 수" },
];

export default function Stats() {
  return (
    <section className="bg-blue-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl md:text-5xl font-extrabold mb-1">{stat.value}</div>
              <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
