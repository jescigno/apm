import SearchCarouselCard from './SearchCarouselCard';

export default function ContentCarousel({ id, title, variant, items, onRemoveFromHistory, onItemSelect }) {
  if (!items?.length) return null;

  return (
    <section
      className={`content-carousel content-carousel--${variant}${id ? ` content-carousel--${id}` : ''}`}
      aria-label={title}
    >
      <h2 className="content-carousel-title">{title}</h2>
      <div className="content-carousel-track" role="list">
        {items.map((item) => (
          <div key={item.id} className="content-carousel-slide" role="listitem">
            <SearchCarouselCard
              variant={variant}
              item={item}
              onRemoveFromHistory={onRemoveFromHistory}
              onSelect={onItemSelect ? () => onItemSelect(item) : undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
