interface Props {
  title: string;
  value: string;
  description?: string;
  trend?: string;
}

const StatsCard = ({ title, value, description, trend }: Props) => {
  return (
    <div
      className="
        bg-[#111111]
        border
        border-neutral-900
        rounded-3xl
        p-6
        hover:border-[#7F1D1D]
        transition-all
        duration-300
      "
    >
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-neutral-500 text-sm">{title}</p>
          <h2 className="text-3xl font-bold text-white mt-3">{value}</h2>
        </div>

        <div
          className="
            w-14
            h-14
            rounded-2xl
            bg-[#7F1D1D]/20
            border
            border-[#7F1D1D]
            flex
            items-center
            justify-center
            text-[#DC2626]
          "
        >
          {trend ? (
            <span className="text-sm font-semibold">{trend}</span>
          ) : null}
        </div>
      </div>

      {/* BOTTOM */}
      {description ? (
        <div className="mt-4">
          <p className="text-neutral-400 text-sm">{description}</p>
        </div>
      ) : null}
    </div>
  );
};

export default StatsCard;
