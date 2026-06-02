import pandas as pd
import matplotlib.pyplot as plt
import os
import numpy as np

def main():
    # 1. File paths
    input_file = 'supplier-list.csv'
    if not os.path.exists(input_file):
        input_file = '/Users/epheriami/Downloads/Projects/aps1013/project/scripts/supplier-list.csv'
        
    output_csv = '/Users/epheriami/Downloads/Projects/aps1013/project/scripts/supplier-list-enriched.csv'
    output_chart = '/Users/epheriami/Downloads/Projects/aps1013/project/scripts/supplier_subregion_histogram.png'

    print(f"Reading supplier data from: {input_file}")
    df = pd.read_csv(input_file)

    # 2. Clean nulls & empty values
    initial_len = len(df)
    df = df.dropna(subset=['Country'])
    df = df[df['Country'].astype(str).str.strip() != '']
    cleaned_len = len(df)
    print(f"Loaded {initial_len} rows. Cleaned to {cleaned_len} valid rows.")

    # 3. Define mapping to UN Sub-Regions
    subregion_map = {
        'USA': 'Northern America',
        'Canada': 'Northern America',
        'France': 'Western Europe',
        'Germany': 'Western Europe',
        'Netherlands': 'Western Europe',
        'Belgium': 'Western Europe',
        'Switzerland': 'Western Europe',
        'Austria': 'Western Europe',
        'UK': 'Northern Europe',
        'Sweden': 'Northern Europe',
        'Italy': 'Southern Europe',
        'Spain': 'Southern Europe',
        'Japan': 'Eastern Asia',
        'Taiwan': 'Eastern Asia',
        'India': 'Southern Asia',
        'Singapore': 'South-Eastern Asia'
    }

    # Enrich dataset
    df['Sub-Region'] = df['Country'].map(subregion_map)

    # Check for unmapped countries
    unmapped = df[df['Sub-Region'].isnull()]['Country'].unique()
    if len(unmapped) > 0:
        print(f"Warning: The following countries were not mapped: {unmapped}")
        # Default fallback
        df['Sub-Region'] = df['Sub-Region'].fillna('Other')

    # Reorder columns to place Sub-Region next to Country
    cols = list(df.columns)
    # Move 'Sub-Region' to index 2 (Supplier, Country, Sub-Region, Category)
    if 'Sub-Region' in cols:
        cols.remove('Sub-Region')
        cols.insert(2, 'Sub-Region')
    df = df[cols]

    # Save enriched CSV
    df.to_csv(output_csv, index=False)
    print(f"Successfully saved enriched dataset to: {output_csv}")

    # 4. Aggregate by Sub-Region
    subregion_counts = df['Sub-Region'].value_counts().sort_values(ascending=True)

    # 5. Visualizing the Sub-Regions
    # Set premium, professional aesthetic
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(12, 7.5), dpi=300)

    # Premium color palette using plasma/magma styles for regional diversity
    colors = plt.cm.plasma(np.linspace(0.4, 0.85, len(subregion_counts)))

    # Draw horizontal bar chart
    bars = ax.barh(subregion_counts.index, subregion_counts.values, color=colors, edgecolor='none', height=0.6)

    # Adjust grids & spines
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#cccccc')
    ax.spines['bottom'].set_color('#cccccc')
    ax.xaxis.grid(True, linestyle='--', alpha=0.5, color='#d0d0d0')
    ax.yaxis.grid(False)

    # Annotate counts at the end of each bar
    max_val = max(subregion_counts.values)
    for bar in bars:
        width = bar.get_width()
        label_x = width + (max_val * 0.01)
        ax.text(label_x, bar.get_y() + bar.get_height()/2, f'{int(width)} ({width/cleaned_len:.1%})',
                va='center', ha='left', fontsize=10, fontweight='bold', color='#2c3e50')

    # Typography & labels
    ax.set_title('Aerospace Supplier Distribution by UN Sub-Region', fontsize=16, fontweight='bold', pad=22, color='#1a252f')
    ax.set_xlabel('Number of Suppliers (with % of Global Total)', fontsize=12, labelpad=12, color='#34495e')
    ax.set_ylabel('UN Sub-Region', fontsize=12, labelpad=12, color='#34495e')
    ax.tick_params(axis='both', which='major', labelsize=10, colors='#2c3e50')

    # Set x limits with padding
    ax.set_xlim(0, max_val + (max_val * 0.12))

    # Watermark
    ax.text(0.98, -0.09, 'Source: supplier-list.csv enriched | Visualized via Antigravity AI', 
            transform=ax.transAxes, fontsize=8.5, color='#95a5a6', ha='right', style='italic')

    plt.tight_layout()
    plt.savefig(output_chart, bbox_inches='tight', dpi=300)
    print(f"Successfully generated and saved sub-region histogram to {output_chart}")

    # Output detailed summary to stdout
    print("\n" + "="*55)
    print(f"{'UN Sub-Region':<25} | {'Country Breakdown':<25} | {'Count':<5}")
    print("="*55)
    
    # Group by sub-region and country to show nested stats
    grouped = df.groupby(['Sub-Region', 'Country']).size().reset_index(name='Count')
    # Sort sub-regions by global size descending
    sorted_subregions = subregion_counts.iloc[::-1].index
    
    for subreg in sorted_subregions:
        subreg_total = subregion_counts[subreg]
        subreg_rows = grouped[grouped['Sub-Region'] == subreg].sort_values(by='Count', ascending=False)
        
        # Format country breakdown
        country_strs = [f"{row['Country']} ({row['Count']})" for _, row in subreg_rows.iterrows()]
        breakdown_str = ", ".join(country_strs)
        
        # Truncate breakdown if too long for table view
        if len(breakdown_str) > 28:
            breakdown_str_short = breakdown_str[:25] + "..."
        else:
            breakdown_str_short = breakdown_str
            
        print(f"{subreg:<25} | {breakdown_str_short:<25} | {subreg_total:<5}")
        
    print("="*55)

if __name__ == '__main__':
    main()
