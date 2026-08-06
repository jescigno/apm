import {
  SEARCH_LAYOUT_TYPES,
  SEARCH_POSTER_SIZE_OPTIONS,
} from '../constants/searchResultsCustomize';
import {
  DEFAULT_PROJECT_CUSTOMIZE,
  PROJECT_LIST_LAYOUT_OPTIONS,
  SEARCH_DISPLAY_FIELD_OPTIONS,
} from '../constants/projectTrackCustomize';
import { ICON_CUSTOMIZE } from '../constants/designSystem';
import {
  CustomizeFieldToggle,
  CustomizeToolbarDropdown,
  LayoutTypeToggle,
  ListLayoutDropdown,
  PosterSizeToggle,
} from './customizeViewControls';

export default function ProjectCustomizeMenus({
  value = DEFAULT_PROJECT_CUSTOMIZE,
  onChange,
}) {
  const isGrid = value.layoutType === SEARCH_LAYOUT_TYPES.GRID;

  const patch = (updates) => onChange?.({ ...value, ...updates });

  const patchDisplayField = (fieldId, enabled) => {
    onChange?.({
      ...value,
      displayFields: { ...value.displayFields, [fieldId]: enabled },
    });
  };

  return (
    <>
      <LayoutTypeToggle
        value={value.layoutType}
        onChange={(layoutType) => patch({ layoutType })}
      />

      <CustomizeToolbarDropdown label="Customize" icon={<img src={ICON_CUSTOMIZE} alt="" />} ariaLabel="Customize view">
        {isGrid ? (
          <div className="customize-view-menu-field">
            <span className="customize-view-menu-field-label">Poster Size</span>
            <PosterSizeToggle
              value={value.posterSize}
              onChange={(posterSize) => patch({ posterSize })}
              options={SEARCH_POSTER_SIZE_OPTIONS}
            />
          </div>
        ) : (
          <ListLayoutDropdown
            value={value.listLayout}
            onChange={(listLayout) => patch({ listLayout })}
            options={PROJECT_LIST_LAYOUT_OPTIONS}
          />
        )}
        {SEARCH_DISPLAY_FIELD_OPTIONS.map(({ id, label }) => (
          <CustomizeFieldToggle
            key={id}
            label={label}
            checked={Boolean(value.displayFields?.[id])}
            onChange={(enabled) => patchDisplayField(id, enabled)}
          />
        ))}
      </CustomizeToolbarDropdown>
    </>
  );
}
