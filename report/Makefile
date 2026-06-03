TEX=pdflatex
OUT_DIR=out
MAIN=main.tex
JOBNAME=aria-report-mignone-s336973
PDF=$(JOBNAME).pdf

.PHONY: compile clean

compile:
	mkdir -p $(OUT_DIR)
	# first pass to generate aux files
	$(TEX) -interaction=nonstopmode -halt-on-error -jobname=$(JOBNAME) -output-directory=$(OUT_DIR) $(MAIN)
	# second pass to resolve references
	$(TEX) -interaction=nonstopmode -halt-on-error -jobname=$(JOBNAME) -output-directory=$(OUT_DIR) $(MAIN)
	# copy final PDF to report root
	mv $(OUT_DIR)/$(PDF) $(PDF)
	@echo "Done: $(PDF) created in report root. Aux files are in $(OUT_DIR)/"

clean:
	rm -rf $(OUT_DIR) $(PDF)
	@echo "Cleaned: removed $(OUT_DIR) and $(PDF)"
