"use client";

import { useState, useEffect } from "react";
import { getNppDataAction, SoldAccount, BuyerInfo, DailyRevenue, MonthlyRevenue } from "@/app/actions/npp";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function DistributorContent() {
  const [activeTab, setActiveTab] = useState<"revenue" | "buyers">("revenue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distributorName, setDistributorName] = useState("");
  const [domain, setDomain] = useState("");
  const [adminFeePercent, setAdminFeePercent] = useState(0);
  const [soldAccounts, setSoldAccounts] = useState<SoldAccount[]>([]);
  const [buyers, setBuyers] = useState<BuyerInfo[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [revenueRange, setRevenueRange] = useState<"7d" | "30d" | "3m" | "6m" | "12m" | "all">("30d");
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getNppDataAction();
        if (res.error) {
          setError(res.error);
        } else {
          setDistributorName(res.distributorName || "");
          setDomain(res.domain || "");
          setAdminFeePercent(res.adminFeePercent || 0);
          setSoldAccounts(res.soldAccounts || []);
          setBuyers(res.buyers || []);
          setDailyRevenue(res.dailyRevenue || []);
          setMonthlyRevenue(res.monthlyRevenue || []);
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRevenue = soldAccounts.reduce((sum, a) => sum + a.price, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] w-full animate-fade-in-up">
        <div className="relative w-12 h-12 mb-4 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full border-4 border-[rgb(251,191,36)]/20"></span>
          <span className="absolute inset-0 rounded-full border-4 border-t-[rgb(251,191,36)] animate-spin"></span>
        </div>
        <p className="text-gray-400 font-sans text-[14px]">Đang tải dữ liệu nhà phân phối...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[600px] mx-auto text-center bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.3)] rounded-2xl p-8 animate-fade-in-up">
        <p className="text-[rgb(248,113,113)] font-bold text-[18px] mb-4">Đã xảy ra lỗi</p>
        <p className="text-gray-300 font-sans text-[14px] mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] text-black font-bold rounded-lg transition-colors cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[900px] mx-auto animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[rgb(251,191,36)] text-[22px] md:text-[28px] font-bold">{distributorName || "Nhà Phân Phối"}</h1>
          <p className="text-[rgba(238,238,238,0.5)] text-[13px] mt-1">
            Quản lý sản phẩm đã bán trên tên miền: <span className="text-[rgb(59,130,246)] font-semibold">{domain}</span>
          </p>
        </div>
        <button 
          onClick={async () => {
            setIsPending(true);
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          disabled={isPending}
          className="px-4 py-2 bg-[rgb(220,38,38)] hover:bg-[rgb(185,28,28)] disabled:opacity-60 text-white font-bold text-[12px] md:text-[13px] rounded-lg transition-colors cursor-pointer"
        >
          {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6">
        <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-xl p-2 md:p-5 text-center">
          <p className="text-[rgba(238,238,238,0.6)] text-[10px] md:text-[13px]">Tổng doanh thu</p>
          <p className="text-[rgb(251,191,36)] text-[13px] md:text-[22px] font-bold mt-0.5 md:mt-1">{totalRevenue.toLocaleString("vi-VN")}đ</p>
        </div>
        <div className="bg-[rgb(2,6,23)] border border-[rgb(251,191,36)] rounded-xl p-2 md:p-5 text-center">
          <p className="text-[rgba(238,238,238,0.6)] text-[10px] md:text-[13px]">Giá nhập ({adminFeePercent}%)</p>
          <p className="text-[rgb(251,191,36)] text-[13px] md:text-[22px] font-bold mt-0.5 md:mt-1">{Math.round(totalRevenue * adminFeePercent / 100).toLocaleString("vi-VN")}đ</p>
        </div>
        <div className="bg-[rgb(2,6,23)] border border-[rgb(34,197,94)] rounded-xl p-2 md:p-5 text-center">
          <p className="text-[rgba(238,238,238,0.6)] text-[10px] md:text-[13px]">Lợi nhuận</p>
          <p className="text-[rgb(34,197,94)] text-[13px] md:text-[22px] font-bold mt-0.5 md:mt-1">
            {Math.round(totalRevenue * (100 - adminFeePercent) / 100).toLocaleString("vi-VN")}đ
          </p>
        </div>
        <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-xl p-2 md:p-5 text-center">
          <p className="text-[rgba(238,238,238,0.6)] text-[10px] md:text-[13px]">Đã bán</p>
          <p className="text-[rgb(34,197,94)] text-[13px] md:text-[22px] font-bold mt-0.5 md:mt-1">{soldAccounts.length} acc</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6 bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-xl overflow-hidden">
        <button onClick={() => setActiveTab("revenue")} className={`flex-1 py-3 text-[13px] md:text-[15px] font-bold transition-colors ${activeTab === "revenue" ? "bg-[rgb(202,138,4)] text-black" : "text-[rgba(238,238,238,0.7)] hover:text-white"}`}>Doanh thu</button>
        <button onClick={() => setActiveTab("buyers")} className={`flex-1 py-3 text-[13px] md:text-[15px] font-bold transition-colors ${activeTab === "buyers" ? "bg-[rgb(202,138,4)] text-black" : "text-[rgba(238,238,238,0.7)] hover:text-white"}`}>Người mua hàng</button>
      </div>

      <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-4 md:p-6">
        {activeTab === "revenue" && (
          <div>
            <h3 className="text-[rgb(251,191,36)] text-[16px] md:text-[20px] font-bold mb-4">Chi tiết doanh thu</h3>

            {/* Chart */}
            {(() => {
              const rangeLabels: Record<string, string> = {
                '7d': '7 ngày', '30d': '30 ngày', '3m': '3 tháng',
                '6m': '6 tháng', '12m': '12 tháng', 'all': 'Tất cả'
              };
              const ranges: Array<"7d" | "30d" | "3m" | "6m" | "12m" | "all"> =
                ['7d', '30d', '3m', '6m', '12m', 'all'];

              let chartData: { label: string; value: number }[] = [];
              const now = new Date();

              if (revenueRange === '7d' || revenueRange === '30d') {
                const days = revenueRange === '7d' ? 7 : 30;
                const cutoff = new Date(now);
                cutoff.setDate(cutoff.getDate() - days);
                const filtered = dailyRevenue.filter(d => new Date(d.date) >= cutoff);
                chartData = filtered.map(d => ({
                  label: new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
                  value: d.total,
                }));
              } else {
                const months = revenueRange === '3m' ? 3 : revenueRange === '6m' ? 6 : revenueRange === '12m' ? 12 : 999;
                const cutoff = months < 999 ? new Date(now.getFullYear(), now.getMonth() - months, 1) : new Date(0);
                const filtered = monthlyRevenue.filter(m => new Date(m.month + "-01") >= cutoff);
                chartData = filtered.map(m => ({
                  label: new Date(m.month + "-01").toLocaleDateString("vi-VN", { month: "short", year: "numeric" }),
                  value: m.total,
                }));
              }

              const hasData = chartData.length > 0;

              return (
                <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-xl p-4 md:p-6 mb-6">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-[rgb(251,191,36)] font-bold text-[14px]">
                        Biểu đồ doanh thu
                      </h4>
                      {hasData && (
                        <span className="text-[12px] text-[rgba(238,238,238,0.6)]">
                          Tổng: <strong className="text-[rgb(251,191,36)]">
                            {chartData.reduce((s, d) => s + d.value, 0).toLocaleString("vi-VN")}đ
                          </strong>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {ranges.map(r => (
                        <button key={r} onClick={() => setRevenueRange(r)}
                          className={`px-2 py-1 text-[11px] rounded transition-colors ${
                            revenueRange === r
                              ? "bg-[rgb(251,191,36)] text-[rgb(2,6,23)] font-bold"
                              : "bg-[rgba(251,191,36,0.1)] text-[rgba(238,238,238,0.7)] hover:bg-[rgba(251,191,36,0.2)]"
                          }`}
                        >
                          {rangeLabels[r]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!hasData ? (
                    <p className="text-[rgba(238,238,238,0.4)] text-[13px] italic text-center py-8">
                      Chưa có dữ liệu doanh thu.
                    </p>
                  ) : (
                    <div className="w-full h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                          <XAxis dataKey="label"
                            tick={{ fill: "rgba(238,238,238,0.5)", fontSize: 11 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                            tickLine={false} interval="preserveStartEnd" />
                          <YAxis tick={{ fill: "rgba(238,238,238,0.5)", fontSize: 11 }}
                            axisLine={false} tickLine={false}
                            tickFormatter={(v: number) =>
                              v >= 1000000 ? `${(v / 1000000).toFixed(1)}tr`
                              : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                            } />
                          <Tooltip contentStyle={{
                              backgroundColor: "rgb(2,6,23)",
                              border: "1px solid rgba(251,191,36,0.3)",
                              borderRadius: "8px", fontSize: "13px",
                            }}
                            labelStyle={{ color: "rgba(238,238,238,0.7)" }}
                            formatter={(value: any) => `${Number(value).toLocaleString("vi-VN")}đ`} />
                          <defs>
                            <linearGradient id="nppRevGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="rgb(251,191,36)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="rgb(251,191,36)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value"
                            stroke="rgb(251,191,36)" strokeWidth={2}
                            fill="url(#nppRevGrad)"
                            dot={false}
                            activeDot={{ r: 4, fill: "rgb(251,191,36)", stroke: "rgb(2,6,23)", strokeWidth: 2 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              );
            })()}

            {soldAccounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-sans text-[13px]">
                Chưa có tài khoản nào được bán qua tên miền của bạn.
              </div>
            ) : (
              <div>
                <div className="relative mb-4">
                  <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(238,238,238,0.4)] text-[13px]" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên sản phẩm..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-[rgb(17,24,39)] text-white text-[13px] pl-9 pr-3 py-2 rounded-lg border border-[rgba(251,191,36,0.2)] focus:border-[rgb(251,191,36)] outline-none transition-colors"
                  />
                </div>
                <div className="overflow-x-auto">
                  {(() => {
                    const filtered = searchTerm
                      ? soldAccounts.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
                      : soldAccounts;
                    return (
                <table className="w-full text-[12px] md:text-[14px]">
                  <thead><tr className="border-b border-[rgb(75,85,99)]">
                    <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">Mã đơn</th>
                    <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">Sản phẩm</th>
                    <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">Người mua</th>
                    <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">Giá bán</th>
                    <th className="text-left py-3 text-[rgba(238,238,238,0.6)] hidden md:table-cell">Ngày mua</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map(acc => (
                      <tr key={acc.id} className="border-b border-[rgb(55,65,81)]">
                        <td className="py-3 text-white">#{acc.id}</td>
                        <td className="py-3 text-[rgb(251,191,36)] font-semibold">{acc.name}</td>
                        <td className="py-3 text-white">{acc.buyer}</td>
                        <td className="py-3 text-white">{acc.price.toLocaleString("vi-VN")}đ</td>
                        <td className="py-3 text-white hidden md:table-cell">{acc.date}</td>
                      </tr>
                    ))}
                  </tbody>
                  {!searchTerm && <tfoot><tr className="border-t-2 border-[rgb(251,191,36)]">
                    <td colSpan={3} className="py-3 text-white font-bold text-right">Tổng:</td>
                    <td className="py-3 text-[rgb(251,191,36)] font-bold">{totalRevenue.toLocaleString("vi-VN")}đ</td>
                    <td className="hidden md:table-cell"></td>
                  </tr></tfoot>}
                </table>
                    );
                  })()}
              </div>
            </div>
          )}
        </div>
      )}

        {activeTab === "buyers" && (
          <div>
            {selectedBuyer === null ? (
              <>
                <h3 className="text-[rgb(251,191,36)] text-[16px] md:text-[20px] font-bold mb-4">Danh sách người mua hàng</h3>
                {buyers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 font-sans text-[13px]">
                    Chưa có khách mua hàng nào qua tên miền của bạn.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px] md:text-[14px]">
                      <thead><tr className="border-b border-[rgb(75,85,99)]">
                        <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">#</th>
                        <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">Người mua</th>
                        <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">Số acc</th>
                        <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">Tổng chi tiêu</th>
                        <th className="text-left py-3 text-[rgba(238,238,238,0.6)] hidden md:table-cell">Lần mua cuối</th>
                      </tr></thead>
                      <tbody>
                        {buyers.map((buyer, i) => (
                          <tr key={buyer.name}
                            onClick={() => setSelectedBuyer(buyer.name)}
                            className="border-b border-[rgb(55,65,81)] cursor-pointer hover:bg-[rgba(251,191,36,0.05)] transition-colors"
                          >
                            <td className="py-3 text-white">{i + 1}</td>
                            <td className="py-3 text-[rgb(251,191,36)] font-semibold">{buyer.name}</td>
                            <td className="py-3 text-white font-bold">{buyer.count}</td>
                            <td className="py-3 text-white">{buyer.totalSpent.toLocaleString("vi-VN")}đ</td>
                            <td className="py-3 text-white hidden md:table-cell">{buyer.lastDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setSelectedBuyer(null)}
                    className="text-[rgba(238,238,238,0.6)] hover:text-white transition-colors"
                  >
                    <i className="fa-solid fa-arrow-left text-[16px]" />
                  </button>
                  <h3 className="text-[rgb(251,191,36)] text-[16px] md:text-[20px] font-bold">
                    Đơn hàng của <span className="text-white">{selectedBuyer}</span>
                  </h3>
                </div>
                {(() => {
                  const buyerOrders = soldAccounts.filter(a => a.buyer === selectedBuyer);
                  if (buyerOrders.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500 font-sans text-[13px]">
                        Không tìm thấy đơn hàng nào.
                      </div>
                    );
                  }
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[12px] md:text-[14px]">
                        <thead><tr className="border-b border-[rgb(75,85,99)]">
                          <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">Mã đơn</th>
                          <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">Tên acc</th>
                          <th className="text-left py-3 text-[rgba(238,238,238,0.6)]">Giá</th>
                          <th className="text-left py-3 text-[rgba(238,238,238,0.6)] hidden md:table-cell">Ngày mua</th>
                        </tr></thead>
                        <tbody>
                          {buyerOrders.map(order => (
                            <tr key={order.id} className="border-b border-[rgb(55,65,81)]">
                              <td className="py-3 text-white">#{order.id}</td>
                              <td className="py-3 text-[rgb(251,191,36)] font-semibold">{order.name}</td>
                              <td className="py-3 text-white">{order.price.toLocaleString("vi-VN")}đ</td>
                              <td className="py-3 text-white hidden md:table-cell">{order.date}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot><tr className="border-t-2 border-[rgb(251,191,36)]">
                          <td colSpan={2} className="py-3 text-white font-bold text-right">Tổng:</td>
                          <td className="py-3 text-[rgb(251,191,36)] font-bold">
                            {buyerOrders.reduce((s, o) => s + o.price, 0).toLocaleString("vi-VN")}đ
                          </td>
                          <td className="hidden md:table-cell"></td>
                        </tr></tfoot>
                      </table>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
