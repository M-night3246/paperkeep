import React from 'react';
import Select from 'react-select';

const IconSelect = ({ options, onChange, placeholder = "Action", disabled = false, }) => {
    const formattedOptions = options.map(({ value, label, Icon }) => ({
        value,
        label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon />
                {label}
            </div>
        ),
        rawLabel: label, // preserve text label (without icon) for other uses
    }));

    const customStyles = {
        control: (base, state) => ({
            ...base,
            fontSize: '0.85rem',
            minHeight: '35px',
            minWidth: '145px',
            borderColor: state.isFocused ? 'var(--accent-color)' : base.borderColor,
            boxShadow: state.isFocused ? '0 0 0 2px var(--accent-color)' : 'none',
            backgroundColor: disabled ? 'var(--grey-light)' : base.backgroundColor,
            cursor: disabled ? 'not-allowed' : 'pointer',
            '&:hover': {
                borderColor: 'var(--accent-color)',
            },
        }),
        option: (base, state) => ({
            ...base,
            fontSize: '0.85rem',
            backgroundColor: state.isSelected
                ? 'var(--green-light)'   // selected background
                : state.isFocused
                    ? 'var(--grey-light)'   // hover background
                    : 'var(--white)',
            color: 'black',
            cursor: disabled ? 'not-allowed' : 'pointer',
            pointerEvents: disabled ? 'none' : 'auto',
        }),
        singleValue: (base) => ({
            ...base,
            fontSize: '0.85rem',
        }),
        dropdownIndicator: (base) => ({
            ...base,
            padding: '4px',
        }),
        indicatorsContainer: (base) => ({
            ...base,
            height: '32px',
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '4px 8px',
        }),
    };


    return (
        <Select
            options={formattedOptions}
            onChange={onChange}
            placeholder={placeholder}
            isSearchable={false}
            isDisabled={disabled}
            styles={customStyles}
        />
    );
};

export default IconSelect;
